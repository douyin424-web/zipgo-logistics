import React, { useState } from 'react';
import { Search, Loader2, MapPin, CheckCircle2 } from 'lucide-react';
import MapView from './MapView';
import { inputCls } from './ui';
import { searchAddress, reverseGeocode } from '../data/geo';

/**
 * Address + map pin.
 *  value:    { address, lat, lng }
 *  onChange: receives the updated value
 * Type an address and press "Find", or tap the map to drop the pin.
 */
export default function AddressPicker({ label, value, onChange, markerType = 'dropoff', placeholder }) {
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [note, setNote] = useState('');

  const hasPin = Number.isFinite(value.lat) && Number.isFinite(value.lng);

  const handleSearch = async () => {
    if (searching) return;
    setNote('');
    setResults([]);
    if (value.address.trim().length < 3) {
      setNote('Type at least 3 letters of the address, or tap the map.');
      return;
    }
    setSearching(true);
    try {
      const found = await searchAddress(value.address);
      setResults(found);
      if (!found.length) setNote('No match found in Lahore. Tap the exact spot on the map instead.');
    } catch {
      setNote('Address search is not available right now. Tap the exact spot on the map instead.');
    } finally {
      setSearching(false);
    }
  };

  const handlePick = async ({ lat, lng }) => {
    setResults([]);
    setNote('');
    const typed = value.address.trim();
    onChange({ address: value.address, lat, lng });
    if (!typed) {
      const found = await reverseGeocode(lat, lng);
      if (found) onChange({ address: found, lat, lng });
    }
  };

  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold text-slate-600">{label}</span>

      <div className="flex gap-2">
        <input
          type="text"
          value={value.address}
          placeholder={placeholder || 'e.g. Street 4, DHA Phase 6, Lahore'}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
          className={inputCls}
        />
        <button
          type="button"
          onClick={handleSearch}
          className="shrink-0 inline-flex items-center gap-1.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>Find</span>
        </button>
      </div>

      {results.length > 0 && (
        <ul className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
          {results.map((r) => (
            <li key={`${r.lat},${r.lng}`}>
              <button
                type="button"
                onClick={() => {
                  onChange({ address: r.label, lat: r.lat, lng: r.lng });
                  setResults([]);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 flex items-start gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>{r.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {note && <p className="text-[11px] text-amber-700">{note}</p>}

      <MapView
        className="h-56"
        markers={hasPin ? [{ id: 'pin', type: markerType, lat: value.lat, lng: value.lng }] : []}
        fitKey={hasPin ? `${value.lat},${value.lng}` : ''}
        onPick={handlePick}
      />

      <p className={`text-[11px] flex items-center gap-1.5 ${hasPin ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
        {hasPin ? <CheckCircle2 className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
        <span>{hasPin ? 'Location pinned. Tap the map to move the pin.' : 'Press Find, or tap the map to drop the pin.'}</span>
      </p>
    </div>
  );
}
