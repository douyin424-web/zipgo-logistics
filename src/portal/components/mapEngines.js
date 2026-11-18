// Two map engines with the same small interface, so MapView does not care which one runs.
//
//  • MapLibre + OpenFreeMap  — the main map: crisp vector tiles in a clean, Google-style
//    look, smooth rider movement, nicer route line. Free, no API key, commercial use allowed.
//  • Leaflet + OpenStreetMap — automatic fallback if WebGL or the vector map is not available.
//
// Both return { setMarkers(list), setRoute(coords|null), fit(points), resize(), destroy() }.
// Coordinates in and out are always { lat, lng } / [lat, lng].

import { loadLeaflet, loadMapLibre, LAHORE } from '../data/geo';

export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

const MARKER_HTML = {
  rider: '<div class="zg-marker-rider"><span></span></div>',
  pickup: '<div class="zg-marker-pin zg-marker-pickup"><b>P</b></div>',
  dropoff: '<div class="zg-marker-pin zg-marker-dropoff"><b>D</b></div>',
};
const markerSize = (type) => (type === 'rider' ? 22 : 30);

function webglAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

// ════════════════════════════════════════════════════════════ MapLibre (main)
export async function createMapLibreEngine(el, { onPick }) {
  if (!webglAvailable()) throw new Error('WebGL is not available');
  const maplibregl = await loadMapLibre();

  const map = new maplibregl.Map({
    container: el,
    style: MAP_STYLE_URL,
    center: [LAHORE.lng, LAHORE.lat],
    zoom: 11.5,
    attributionControl: { compact: true },
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false,
  });
  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  map.on('click', (e) => onPick && onPick({ lat: e.lngLat.lat, lng: e.lngLat.lng }));

  // Wait for the style; give up (→ fallback) if the tiles server cannot be reached
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Map style timed out')), 12000);
    map.once('style.load', () => {
      clearTimeout(timer);
      resolve();
    });
    map.on('error', (e) => {
      // an error before the style is ready means the map server cannot be reached
      if (!map.isStyleLoaded()) {
        clearTimeout(timer);
        reject((e && e.error) || new Error('Map style failed to load'));
      }
    });
  }).catch((err) => {
    map.remove();
    throw err;
  });

  // Route line: white outline + blue line, like a navigation app
  map.addSource('zg-route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addLayer({
    id: 'zg-route-casing',
    type: 'line',
    source: 'zg-route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#FFFFFF', 'line-width': 9, 'line-opacity': 0.95 },
  });
  map.addLayer({
    id: 'zg-route-line',
    type: 'line',
    source: 'zg-route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#2563EB', 'line-width': 5.5 },
  });

  const live = new Map(); // id → { marker, type, at:[lng,lat], raf }

  function glide(entry, to) {
    if (entry.raf) cancelAnimationFrame(entry.raf);
    const from = entry.at;
    const started = performance.now();
    const duration = 1200;
    const step = (now) => {
      const t = Math.min(1, (now - started) / duration);
      const ease = 1 - (1 - t) * (1 - t);
      const pos = [from[0] + (to[0] - from[0]) * ease, from[1] + (to[1] - from[1]) * ease];
      entry.marker.setLngLat(pos);
      entry.at = pos;
      entry.raf = t < 1 ? requestAnimationFrame(step) : 0;
    };
    entry.raf = requestAnimationFrame(step);
  }

  return {
    setMarkers(list) {
      const keep = new Set();
      list.forEach((m) => {
        keep.add(m.id);
        const to = [m.lng, m.lat];
        const existing = live.get(m.id);
        if (existing && existing.type === m.type) {
          if (m.type === 'rider') glide(existing, to);
          else {
            existing.marker.setLngLat(to);
            existing.at = to;
          }
          return;
        }
        if (existing) existing.marker.remove();

        const size = markerSize(m.type);
        const holder = document.createElement('div');
        holder.style.width = `${size}px`;
        holder.style.height = `${size}px`;
        holder.innerHTML = MARKER_HTML[m.type] || MARKER_HTML.pickup;
        if (m.label) holder.title = m.label;
        const marker = new maplibregl.Marker({ element: holder, anchor: m.type === 'rider' ? 'center' : 'bottom' })
          .setLngLat(to)
          .addTo(map);
        if (m.type === 'rider') holder.style.zIndex = '5';
        live.set(m.id, { marker, type: m.type, at: to, raf: 0 });
      });
      [...live.keys()].forEach((id) => {
        if (!keep.has(id)) {
          const entry = live.get(id);
          if (entry.raf) cancelAnimationFrame(entry.raf);
          entry.marker.remove();
          live.delete(id);
        }
      });
    },

    setRoute(coords) {
      const source = map.getSource('zg-route');
      if (!source) return;
      source.setData(
        coords && coords.length > 1
          ? { type: 'Feature', geometry: { type: 'LineString', coordinates: coords.map(([lat, lng]) => [lng, lat]) } }
          : { type: 'FeatureCollection', features: [] }
      );
    },

    fit(points) {
      if (!points.length) return;
      if (points.length === 1) {
        map.easeTo({ center: [points[0][1], points[0][0]], zoom: 15, duration: 600 });
        return;
      }
      const bounds = new maplibregl.LngLatBounds();
      points.forEach(([lat, lng]) => bounds.extend([lng, lat]));
      map.fitBounds(bounds, { padding: 50, maxZoom: 16, duration: 700 });
    },

    resize: () => map.resize(),

    destroy() {
      live.forEach((entry) => entry.raf && cancelAnimationFrame(entry.raf));
      live.clear();
      map.remove();
    },
  };
}

// ════════════════════════════════════════════════════════════ Leaflet (fallback)
export async function createLeafletEngine(el, { onPick }) {
  const L = await loadLeaflet();
  const map = L.map(el, { zoomControl: true }).setView([LAHORE.lat, LAHORE.lng], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  map.on('click', (e) => onPick && onPick({ lat: e.latlng.lat, lng: e.latlng.lng }));
  const markerLayer = L.layerGroup().addTo(map);
  const routeLayer = L.layerGroup().addTo(map);
  setTimeout(() => map.invalidateSize(), 0);

  return {
    setMarkers(list) {
      markerLayer.clearLayers();
      list.forEach((m) => {
        const isRider = m.type === 'rider';
        const icon = L.divIcon({
          className: '',
          html: MARKER_HTML[m.type] || MARKER_HTML.pickup,
          iconSize: isRider ? [22, 22] : [30, 30],
          iconAnchor: isRider ? [11, 11] : [15, 30],
        });
        const marker = L.marker([m.lat, m.lng], { icon, zIndexOffset: isRider ? 1000 : 0 });
        if (m.label) marker.bindTooltip(m.label, { direction: 'top', offset: [0, isRider ? -12 : -30] });
        marker.addTo(markerLayer);
      });
    },
    setRoute(coords) {
      routeLayer.clearLayers();
      if (coords && coords.length > 1) {
        L.polyline(coords, { color: '#FFFFFF', weight: 9, opacity: 0.95, lineJoin: 'round' }).addTo(routeLayer);
        L.polyline(coords, { color: '#2563EB', weight: 5, opacity: 0.95, lineJoin: 'round' }).addTo(routeLayer);
      }
    },
    fit(points) {
      if (points.length === 1) map.setView(points[0], 15);
      else if (points.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 16 });
    },
    resize: () => map.invalidateSize(),
    destroy: () => map.remove(),
  };
}
