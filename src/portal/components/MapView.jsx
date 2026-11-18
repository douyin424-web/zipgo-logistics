import React, { useEffect, useRef, useState } from 'react';
import { Loader2, MapPinOff, LocateFixed } from 'lucide-react';
import { createMapLibreEngine, createLeafletEngine } from './mapEngines';

/**
 * Free map: OpenFreeMap vector tiles drawn with MapLibre (clean Google-style look,
 * smooth rider movement). Falls back to OpenStreetMap + Leaflet if the vector map
 * cannot start. No API key, no cost.
 *  markers: [{ id, type: 'rider' | 'pickup' | 'dropoff', lat, lng, label }]
 *  route:   [[lat, lng], ...]  drawn as the blue line
 *  onPick:  called with { lat, lng } when the map is clicked
 *  fitKey:  change it to re-fit the view around the markers and route
 */
export default function MapView({ markers = [], route = null, onPick, fitKey = '', className = 'h-72' }) {
  const elRef = useRef(null);
  const engineRef = useRef(null);
  const onPickRef = useRef(onPick);
  const [state, setState] = useState('loading'); // loading | ready | error

  onPickRef.current = onPick;

  // Start the map once: vector map first, plain OpenStreetMap map as the safety net
  useEffect(() => {
    let cancelled = false;
    const handlers = { onPick: (point) => onPickRef.current && onPickRef.current(point) };

    (async () => {
      let engine = null;
      try {
        engine = await createMapLibreEngine(elRef.current, handlers);
      } catch {
        try {
          if (elRef.current) elRef.current.innerHTML = '';
          if (!cancelled) engine = await createLeafletEngine(elRef.current, handlers);
        } catch {
          engine = null;
        }
      }
      if (cancelled) {
        if (engine) engine.destroy();
        return;
      }
      if (!engine) {
        setState('error');
        return;
      }
      engineRef.current = engine;
      setState('ready');
      setTimeout(() => engine.resize(), 0);
    })();

    return () => {
      cancelled = true;
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, []);

  const validMarkers = markers.filter((m) => m && Number.isFinite(m.lat) && Number.isFinite(m.lng));
  const markersKey = validMarkers.map((m) => `${m.id}:${m.type}:${m.lat.toFixed(5)}:${m.lng.toFixed(5)}`).join('|');
  const routeKey = route && route.length ? `${route.length}:${route[0].join(',')}:${route[route.length - 1].join(',')}` : '';

  const fitPoints = () => validMarkers.map((m) => [m.lat, m.lng]).concat(route && route.length > 1 ? route : []);

  useEffect(() => {
    if (state === 'ready' && engineRef.current) engineRef.current.setMarkers(validMarkers);
  }, [state, markersKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (state === 'ready' && engineRef.current) engineRef.current.setRoute(route && route.length > 1 ? route : null);
  }, [state, routeKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (state === 'ready' && engineRef.current) engineRef.current.fit(fitPoints());
  }, [state, fitKey, routeKey, validMarkers.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`relative z-0 isolate rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 ${className}`}>
      <div ref={elRef} className="absolute inset-0" />

      {state === 'ready' && validMarkers.length > 0 && (
        <button
          type="button"
          onClick={() => engineRef.current && engineRef.current.fit(fitPoints())}
          className="absolute left-2.5 top-2.5 z-[5] w-9 h-9 rounded-lg bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600"
          aria-label="Center the map on the delivery"
          title="Center map"
        >
          <LocateFixed className="w-4 h-4" />
        </button>
      )}

      {state !== 'ready' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs font-semibold text-slate-500 text-center px-6 bg-slate-100">
          {state === 'loading' ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Loading map…</span>
            </>
          ) : (
            <>
              <MapPinOff className="w-6 h-6 text-slate-400" />
              <span>The map could not be loaded. Check your internet connection and reload the page.</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
