'use strict';

// Order dispatch, rider locations and live notifications.
//
//  1. New order → offered to EVERY online, free rider immediately
//  2. Riders who come online later also get the waiting order
//  3. MAX_DECLINES declines → order fails
//  4. Nobody accepts within PENDING_TIMEOUT_SECONDS → order fails
//  The first rider to accept gets the order (atomic database update).
//
// State lives in memory, so run ONE backend process. Pending orders are picked
// up again after a restart.
const { haversineKm } = require('../lib/geo');
const { toOrder, toPublicRider } = require('../repos/serializers');

const LOCATION_DB_WRITE_MS = 15000;
const ACTIVE_CACHE_MS = 20000;

function createDispatcher({ repos, config, hub }) {
  const cfg = config.dispatch;
  const offers = new Map(); // orderId → { notified:Set, phase, timers:[] }
  const locations = new Map(); // riderId → { lat, lng, heading, at, savedAt }
  const activeCache = new Map(); // riderId → { order|null, until }
  let sweeper = null;

  // ───────────────────────────── helpers
  function riderPoint(riderRow) {
    const live = locations.get(riderRow.id);
    if (live) return { lat: live.lat, lng: live.lng };
    if (riderRow.last_lat != null && riderRow.last_lng != null) {
      return { lat: Number(riderRow.last_lat), lng: Number(riderRow.last_lng) };
    }
    return null;
  }

  // Public rider info with the freshest location we have
  function publicRider(riderRow) {
    if (!riderRow) return null;
    const out = toPublicRider(riderRow);
    const live = locations.get(riderRow.id);
    if (live) {
      out.lat = live.lat;
      out.lng = live.lng;
      out.locationAt = live.at;
    }
    return out;
  }

  async function orderPayload(orderRow) {
    const rider = orderRow.rider_id ? await repos.riders.findById(orderRow.rider_id) : null;
    return { order: toOrder(orderRow), rider: publicRider(rider) };
  }

  // Tell the business (and the assigned rider) that the order changed
  async function notifyOrder(orderRow) {
    const payload = await orderPayload(orderRow);
    hub.sendTo('business', orderRow.business_id, 'order:updated', payload);
    if (orderRow.rider_id) hub.sendTo('rider', orderRow.rider_id, 'order:updated', payload);
    return payload;
  }

  function clearOffer(orderId) {
    const state = offers.get(orderId);
    if (!state) return null;
    state.timers.forEach(clearTimeout);
    offers.delete(orderId);
    return state;
  }

  function withdraw(orderId, exceptRiderId) {
    const state = clearOffer(orderId);
    if (state) {
      for (const riderId of state.notified) {
        if (riderId !== exceptRiderId) hub.sendTo('rider', riderId, 'order:withdrawn', { orderId });
      }
    }
    if (hub.broadcastToRole) {
      hub.broadcastToRole('rider', 'order:withdrawn', { orderId }, exceptRiderId);
    }
  }

  async function eligibleRiders(orderRow, nearbyOnly = false) {
    const [online, busyIds, declinedIds] = await Promise.all([
      repos.riders.listOnline(),
      repos.orders.activeRiderIds(),
      repos.orders.declinedRiderIds(orderRow.id),
    ]);
    const busy = new Set(busyIds);
    const declined = new Set(declinedIds);
    const pickup = { lat: Number(orderRow.pickup_lat), lng: Number(orderRow.pickup_lng) };

    return online
      .filter((r) => !busy.has(r.id) && !declined.has(r.id))
      .map((r) => {
        const point = riderPoint(r);
        return { rider: r, distanceKm: point ? haversineKm(point, pickup) : 0 };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  function offerTo(orderRow, riderIds) {
    const state = offers.get(orderRow.id);
    if (!state) return;
    const order = toOrder(orderRow, { hideCustomerPhone: true });
    for (const riderId of riderIds) {
      if (state.notified.has(riderId)) continue;
      state.notified.add(riderId);
      hub.sendTo('rider', riderId, 'order:new-request', { order, offerSeconds: cfg.offerSeconds });
    }
  }

  async function broadcast(orderId) {
    const state = offers.get(orderId);
    if (!state) return;
    const row = await repos.orders.findById(orderId);
    if (!row || row.status !== 'pending') {
      clearOffer(orderId);
      return;
    }
    state.phase = 'all';
    const riders = await eligibleRiders(row, false);
    offerTo(row, riders.map((x) => x.rider.id));

    // Also broadcast to all connected riders so every online device gets the request immediately
    if (hub.broadcastToRole) {
      const order = toOrder(row, { hideCustomerPhone: true });
      hub.broadcastToRole('rider', 'order:new-request', { order, offerSeconds: cfg.offerSeconds });
    }
  }

  async function fail(orderId, reason) {
    const changed = await repos.orders.failIfPending(orderId, reason);
    withdraw(orderId);
    if (changed) {
      const row = await repos.orders.findById(orderId);
      if (row) await notifyOrder(row);
    }
  }

  const safely = (fn) => (...args) =>
    fn(...args).catch((err) => console.error('[dispatch]', err && err.message ? err.message : err));

  // ───────────────────────────── public API
  async function startOrder(orderRow) {
    if (offers.has(orderRow.id)) return;
    const state = { notified: new Set(), phase: 'all', timers: [] };
    offers.set(orderRow.id, state);

    const ageMs = Date.now() - new Date(orderRow.created_at).getTime();
    const timeoutLeft = Math.max(1000, cfg.pendingTimeoutSeconds * 1000 - ageMs);

    // Every online, free rider sees the order straight away; the first to accept gets it
    await broadcast(orderRow.id);
    state.timers.push(setTimeout(safely(fail), timeoutLeft, orderRow.id, 'No rider accepted the order in time'));
  }

  async function afterAccept(orderRow, riderId) {
    withdraw(orderRow.id, riderId);
    activeCache.delete(riderId);
    return notifyOrder(orderRow);
  }

  async function afterDecline(orderRow, riderId, declineCount) {
    if (declineCount !== null && declineCount >= cfg.maxDeclines) {
      await fail(orderRow.id, 'No available riders accepted the order');
      return;
    }
    const state = offers.get(orderRow.id);
    if (!state) return;
    // Everyone we asked has said no → ask everybody else right away
    const declined = new Set(await repos.orders.declinedRiderIds(orderRow.id));
    const allDeclined = [...state.notified].every((id) => declined.has(id));
    if (allDeclined && state.phase === 'nearby') await broadcast(orderRow.id);
    else if (allDeclined) {
      const riders = await eligibleRiders(orderRow, false);
      offerTo(orderRow, riders.map((x) => x.rider.id));
    }
  }

  function afterCancel(orderId) {
    withdraw(orderId);
  }

  // A rider came online or finished a delivery: offer waiting orders
  async function riderAvailable(riderId) {
    const rider = await repos.riders.findById(riderId);
    if (!rider || rider.status !== 'online') return;
    if (await repos.orders.activeForRider(riderId)) return;

    for (const [orderId, state] of offers) {
      const row = await repos.orders.findById(orderId);
      if (!row || row.status !== 'pending') continue;
      const declined = await repos.orders.declinedRiderIds(orderId);
      if (declined.includes(riderId)) continue;
      offerTo(row, [riderId]);
    }
  }

  // Pending orders currently offered to this rider (for polling clients)
  async function requestsFor(riderId) {
    const out = [];
    const busy = await repos.orders.activeForRider(riderId);
    if (busy) return [];

    for (const [orderId, state] of offers) {
      const row = await repos.orders.findById(orderId);
      if (!row || row.status !== 'pending') continue;
      const declined = await repos.orders.declinedRiderIds(orderId);
      if (declined.includes(riderId)) continue;
      state.notified.add(riderId);
      out.push(toOrder(row, { hideCustomerPhone: true }));
    }
    return out;
  }

  async function activeOrderOf(riderId) {
    const cached = activeCache.get(riderId);
    if (cached && cached.until > Date.now()) return cached.order;
    const order = await repos.orders.activeForRider(riderId);
    activeCache.set(riderId, { order, until: Date.now() + ACTIVE_CACHE_MS });
    return order;
  }

  function forgetActive(riderId) {
    activeCache.delete(riderId);
  }

  // Rider GPS update (WebSocket or HTTP)
  async function updateLocation(riderId, lat, lng, heading = 0) {
    const now = new Date();
    const previous = locations.get(riderId);
    const entry = { lat, lng, heading: Number(heading) || 0, at: now.toISOString(), savedAt: previous ? previous.savedAt : 0 };
    locations.set(riderId, entry);

    if (Date.now() - entry.savedAt > LOCATION_DB_WRITE_MS) {
      entry.savedAt = Date.now();
      await repos.riders.setLocation(riderId, lat, lng, now);
    }

    const active = await activeOrderOf(riderId);
    if (active) {
      hub.sendTo('business', active.business_id, 'rider:location', {
        orderId: active.id,
        riderId,
        lat,
        lng,
        heading: entry.heading,
        at: entry.at,
      });
    }
  }

  async function riderOffline(riderId) {
    const entry = locations.get(riderId);
    if (entry) await repos.riders.setLocation(riderId, entry.lat, entry.lng, new Date(entry.at));
    locations.delete(riderId);
  }

  async function start() {
    const pending = await repos.orders.listPending();
    for (const row of pending) {
      const ageMs = Date.now() - new Date(row.created_at).getTime();
      if (ageMs > cfg.pendingTimeoutSeconds * 1000) {
        await fail(row.id, 'No rider accepted the order in time');
      } else {
        await startOrder(row);
      }
    }
    if (pending.length) console.log(`[dispatch] resumed ${pending.length} pending order(s)`);

    // Riders who stopped sending their location are set offline
    sweeper = setInterval(
      safely(async () => {
        const cutoff = new Date(Date.now() - cfg.riderStaleMinutes * 60000);
        const ids = await repos.riders.goOfflineIfStale(cutoff);
        for (const id of ids) {
          const live = locations.get(id);
          if (live && new Date(live.at) >= cutoff) {
            await repos.riders.setStatus(id, 'online'); // still active over WebSocket
            continue;
          }
          locations.delete(id);
          hub.sendTo('rider', id, 'rider:status', { status: 'offline', reason: 'No location received for a while' });
        }
        await repos.otp.removeExpired();
      }),
      60000
    );
    sweeper.unref();
  }

  function stop() {
    if (sweeper) clearInterval(sweeper);
    for (const orderId of [...offers.keys()]) clearOffer(orderId);
  }

  return {
    startOrder: safely(startOrder),
    afterAccept,
    afterDecline: safely(afterDecline),
    afterCancel,
    riderAvailable: safely(riderAvailable),
    requestsFor,
    updateLocation,
    riderOffline,
    forgetActive,
    notifyOrder,
    orderPayload,
    publicRider,
    start,
    stop,
  };
}

module.exports = { createDispatcher };
