'use strict';

// Distance, routing (OSRM, free) and fare rules.
const { hourIn } = require('./time');

function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

const round = (n, digits = 2) => Math.round(n * 10 ** digits) / 10 ** digits;

// Road route; falls back to an estimate from the straight-line distance
async function routeBetween(osrmUrl, from, to, timeoutMs = 5000) {
  try {
    const url = `${osrmUrl}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false`;
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`OSRM ${res.status}`);
    const data = await res.json();
    const route = data.routes && data.routes[0];
    if (!route) throw new Error('No route');
    return {
      distanceKm: round(route.distance / 1000),
      durationMins: Math.max(1, Math.round(route.duration / 60)),
      approximate: false,
    };
  } catch {
    const distanceKm = round(haversineKm(from, to) * 1.3);
    return { distanceKm, durationMins: Math.max(1, Math.round((distanceKm / 22) * 60)), approximate: true };
  }
}

function isPeak(pricing, timeZone, date = new Date()) {
  const hour = hourIn(timeZone, date);
  return pricing.peakHours.some(([from, to]) => hour >= from && hour < to);
}

// Base + per km, × peak multiplier during peak hours
function calculateFare(pricing, timeZone, distanceKm, date = new Date()) {
  const base = pricing.baseFare + pricing.perKm * distanceKm;
  const peak = isPeak(pricing, timeZone, date);
  return {
    baseFare: pricing.baseFare,
    perKm: pricing.perKm,
    distanceFare: Math.round(pricing.perKm * distanceKm),
    peak,
    peakMultiplier: pricing.peakMultiplier,
    total: Math.round(peak ? base * pricing.peakMultiplier : base),
  };
}

module.exports = { haversineKm, routeBetween, calculateFare, round };
