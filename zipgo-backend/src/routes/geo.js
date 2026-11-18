'use strict';

const v = require('../lib/validate');
const { createLimiter } = require('../lib/rateLimit');
const { haversineKm } = require('../lib/geo');

function parsePoint(text, field) {
  const [lat, lng] = String(text || '').split(',');
  return v.point({ lat, lng }, field);
}

// Map endpoints (formerly the separate "indrive-backend-geospatial" service)
function registerGeoRoutes(router, { config, repos, auth, dispatcher, geo }) {
  const perAccount = createLimiter({ limit: 120, windowMs: 60000 });

  router.get('/geo/search', async ({ req, query }) => {
    const { account } = await auth.requireAccount(req);
    perAccount(`geo:${account.id}`);
    const q = v.str(query.q, 'Search text', { min: 3, max: 200 });
    try {
      return await geo.search(q);
    } catch {
      return [];
    }
  });

  router.get('/geo/reverse', async ({ req, query }) => {
    const { account } = await auth.requireAccount(req);
    perAccount(`geo:${account.id}`);
    const p = v.point(query, 'Map');
    return { address: await geo.reverse(p.lat, p.lng) };
  });

  // ?from=lat,lng&to=lat,lng
  router.get('/geo/route', async ({ req, query }) => {
    const { account } = await auth.requireAccount(req);
    perAccount(`geo:${account.id}`);
    return geo.route(parsePoint(query.from, 'Start'), parsePoint(query.to, 'End'));
  });

  // Online riders free near a point (positions only, no names) — for the business dashboard
  router.get('/geo/riders-nearby', async ({ req, query }) => {
    const { account } = await auth.requireAccount(req, 'business');
    const center = query.lat !== undefined ? v.point(query, 'Center') : { lat: Number(account.lat), lng: Number(account.lng) };
    const radiusKm = config.dispatch.radiusKm;
    const [online, busyIds] = await Promise.all([repos.riders.listOnline(), repos.orders.activeRiderIds()]);
    const busy = new Set(busyIds);
    const riders = [];
    for (const r of online) {
      const pub = dispatcher.publicRider(r);
      if (pub.lat == null || pub.lng == null) continue;
      const distanceKm = haversineKm(center, { lat: pub.lat, lng: pub.lng });
      if (distanceKm <= radiusKm) {
        riders.push({ lat: pub.lat, lng: pub.lng, distanceKm: Math.round(distanceKm * 10) / 10, available: !busy.has(r.id) });
      }
    }
    riders.sort((a, b) => a.distanceKm - b.distanceKm);
    return { radiusKm, available: riders.filter((r) => r.available).length, riders };
  });
}

module.exports = { registerGeoRoutes };
