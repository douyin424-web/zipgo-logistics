'use strict';

// Map services for the portals: address search, reverse geocoding (Nominatim)
// and road routes (OSRM), with caching so the free servers are not overloaded.
const { haversineKm, round } = require('./geo');

function createCache(ttlMs, max = 2000) {
  const map = new Map();
  return {
    get(key) {
      const hit = map.get(key);
      if (!hit) return undefined;
      if (hit.until < Date.now()) {
        map.delete(key);
        return undefined;
      }
      return hit.value;
    },
    set(key, value) {
      if (map.size >= max) map.delete(map.keys().next().value);
      map.set(key, { value, until: Date.now() + ttlMs });
    },
  };
}

function createGeoServices(config) {
  const searchCache = createCache(30 * 60000);
  const reverseCache = createCache(60 * 60000);
  const routeCache = createCache(10 * 60000);

  // Nominatim allows about one request per second
  let nominatimQueue = Promise.resolve();
  let lastNominatim = 0;
  function nominatim(path) {
    const job = nominatimQueue.then(async () => {
      const waitMs = Math.max(0, lastNominatim + 1100 - Date.now());
      if (waitMs) await new Promise((r) => setTimeout(r, waitMs));
      lastNominatim = Date.now();
      const res = await fetch(`${config.nominatimUrl}${path}`, {
        headers: { 'User-Agent': config.geoUserAgent, Accept: 'application/json', 'Accept-Language': 'en' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`Nominatim ${res.status}`);
      return res.json();
    });
    nominatimQueue = job.catch(() => {});
    return job;
  }

  // Keep searches near the service area
  function viewbox() {
    const { lat, lng, radiusKm } = config.serviceArea;
    const r = Math.max(radiusKm || 40, 10);
    const dLat = r / 111;
    const dLng = r / (111 * Math.cos((lat * Math.PI) / 180));
    return `${round(lng - dLng, 4)},${round(lat + dLat, 4)},${round(lng + dLng, 4)},${round(lat - dLat, 4)}`;
  }

  async function search(query) {
    const q = query.trim().toLowerCase();
    const cached = searchCache.get(q);
    if (cached) return cached;
    const data = await nominatim(
      `/search?format=json&limit=5&countrycodes=pk&viewbox=${viewbox()}&bounded=1&q=${encodeURIComponent(q)}`
    );
    const results = data.map((item) => ({ label: item.display_name, lat: Number(item.lat), lng: Number(item.lon) }));
    searchCache.set(q, results);
    return results;
  }

  async function reverse(lat, lng) {
    const key = `${round(lat, 4)},${round(lng, 4)}`;
    const cached = reverseCache.get(key);
    if (cached !== undefined) return cached;
    try {
      const data = await nominatim(`/reverse?format=json&zoom=18&lat=${lat}&lon=${lng}`);
      const address = data.display_name || null;
      reverseCache.set(key, address);
      return address;
    } catch {
      return null;
    }
  }

  // Road route with the line to draw; falls back to a straight line
  async function route(from, to) {
    const key = `${round(from.lat, 4)},${round(from.lng, 4)};${round(to.lat, 4)},${round(to.lng, 4)}`;
    const cached = routeCache.get(key);
    if (cached) return cached;
    let result;
    try {
      const url = `${config.osrmUrl}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`OSRM ${res.status}`);
      const data = await res.json();
      const r = data.routes && data.routes[0];
      if (!r) throw new Error('No route');
      result = {
        coords: r.geometry.coordinates.map(([lng, lat]) => [round(lat, 6), round(lng, 6)]),
        distanceKm: round(r.distance / 1000),
        durationMins: Math.max(1, Math.round(r.duration / 60)),
        approximate: false,
      };
    } catch {
      const distanceKm = round(haversineKm(from, to) * 1.3);
      result = {
        coords: [
          [from.lat, from.lng],
          [to.lat, to.lng],
        ],
        distanceKm,
        durationMins: Math.max(1, Math.round((distanceKm / 22) * 60)),
        approximate: true,
      };
    }
    routeCache.set(key, result);
    return result;
  }

  return { search, reverse, route };
}

module.exports = { createGeoServices };
