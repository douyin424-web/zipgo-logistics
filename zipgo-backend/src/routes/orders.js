'use strict';

const { created } = require('../lib/http');
const v = require('../lib/validate');
const { badRequest, conflict, forbidden, notFound } = require('../lib/errors');
const { routeBetween, calculateFare } = require('../lib/geo');
const { dayStamp } = require('../lib/time');
const { toOrder } = require('../repos/serializers');
const { checkServiceArea } = require('./business');

const ORDER_TYPES = ['restaurant', 'ecommerce', 'courier'];

function registerOrderRoutes(router, { config, repos, auth, dispatcher }) {
  async function quote(business, dropPoint) {
    const pickup = { lat: Number(business.lat), lng: Number(business.lng) };
    const route = await routeBetween(config.osrmUrl, pickup, dropPoint);
    const fare = calculateFare(config.pricing, config.timezone, route.distanceKm);
    return { ...route, fare };
  }

  function readDrop(body) {
    const drop = body.drop || {};
    const point = v.point(drop, 'Dropoff');
    checkServiceArea(config, point, 'The dropoff address');
    return { ...point, address: v.str(drop.address, 'Dropoff address', { min: 3, max: 500 }) };
  }

  // Fare before placing the order
  router.post('/pricing/estimate', async ({ req, body }) => {
    const { account } = await auth.requireAccount(req, 'business');
    const drop = v.point(body.drop || {}, 'Dropoff');
    checkServiceArea(config, drop, 'The dropoff address');
    return quote(account, drop);
  });

  router.get('/pricing/rules', async () => ({
    baseFare: config.pricing.baseFare,
    perKm: config.pricing.perKm,
    peakMultiplier: config.pricing.peakMultiplier,
    peakHours: config.pricing.peakHours,
    timezone: config.timezone,
  }));

  // ───────────── business
  router.post('/orders', async ({ req, body }) => {
    const { account } = await auth.requireAccount(req, 'business');
    const drop = readDrop(body);
    const details = {
      dropName: v.str(body.customerName, 'Customer name', { min: 2, max: 120 }),
      dropPhone: v.optionalPhone(body.customerPhone, 'Customer phone'),
      packageDetails: v.str(body.packageDetails, 'Package details', { max: 500, optional: true }),
      weightKg: v.number(body.weightKg, 'Weight', { min: 0, max: 200, optional: true }),
      orderType: v.oneOf(body.orderType || 'restaurant', 'Order type', ORDER_TYPES),
    };

    // The server always works out the distance and fare itself
    const q = await quote(account, drop);
    const orderNumber = await repos.orders.nextOrderNumber(dayStamp(config.timezone));
    const row = await repos.orders.create({
      orderNumber,
      businessId: account.id,
      orderType: details.orderType,
      pickupName: account.business_name,
      pickupAddress: account.address,
      pickupLat: Number(account.lat),
      pickupLng: Number(account.lng),
      dropName: details.dropName,
      dropPhone: details.dropPhone,
      dropAddress: drop.address,
      dropLat: drop.lat,
      dropLng: drop.lng,
      packageDetails: details.packageDetails,
      weightKg: details.weightKg,
      distanceKm: q.distanceKm,
      durationMins: q.durationMins,
      routeApproximate: q.approximate,
      fare: q.fare.total,
      isPeak: q.fare.peak,
    });

    dispatcher.startOrder(row);
    return created(toOrder(row));
  });

  router.get('/orders', async ({ req, query }) => {
    const { account } = await auth.requireAccount(req, 'business');
    const status = query.status ? v.oneOf(query.status, 'status', ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled']) : null;
    const rows = await repos.orders.listForBusiness(account.id, status);

    // Include the riders of these orders so the portal can show names and the map
    const riderIds = [...new Set(rows.map((r) => r.rider_id).filter(Boolean))].slice(0, 100);
    const riders = [];
    for (const id of riderIds) {
      const rider = await repos.riders.findById(id);
      if (rider) riders.push(dispatcher.publicRider(rider));
    }
    return { orders: rows.map((r) => toOrder(r)), riders };
  });

  router.get('/orders/:id', async ({ req, params }) => {
    const { role, account } = await auth.requireAccount(req);
    const row = await repos.orders.findById(params.id);
    if (!row) throw notFound('Order not found.');
    const isOwner = role === 'business' && row.business_id === account.id;
    const isRider = role === 'rider' && row.rider_id === account.id;
    if (!isOwner && !isRider) throw forbidden('This order belongs to someone else.');
    return dispatcher.orderPayload(row);
  });

  router.post('/orders/:id/cancel', async ({ req, params }) => {
    const { account } = await auth.requireAccount(req, 'business');
    const row = await repos.orders.findById(params.id);
    if (!row || row.business_id !== account.id) throw notFound('Order not found.');
    if (!(await repos.orders.cancel(params.id, account.id))) {
      throw conflict('This order can no longer be cancelled — a rider has already accepted it.');
    }
    dispatcher.afterCancel(params.id);
    const updated = await repos.orders.findById(params.id);
    await dispatcher.notifyOrder(updated);
    return toOrder(updated);
  });

  // ───────────── rider
  router.post('/orders/:id/accept', async ({ req, params }) => {
    const { account } = await auth.requireAccount(req, 'rider');
    if (await repos.orders.activeForRider(account.id)) throw conflict('Finish your current delivery first.');
    const declined = await repos.orders.declinedRiderIds(params.id);
    if (declined.includes(account.id)) throw conflict('You already passed on this order.');

    const won = await repos.orders.accept(params.id, account.id);
    if (!won) throw conflict('This order is no longer available — another rider took it.');
    const row = await repos.orders.findById(params.id);
    return dispatcher.afterAccept(row, account.id);
  });

  router.post('/orders/:id/decline', async ({ req, params, body }) => {
    const { account } = await auth.requireAccount(req, 'rider');
    const reason = body.reason === 'timeout' ? 'timeout' : 'declined';
    const row = await repos.orders.findById(params.id);
    if (!row) throw notFound('Order not found.');
    if (row.status !== 'pending') return { ok: true };
    const count = await repos.orders.addDecline(params.id, account.id, reason);
    await dispatcher.afterDecline(row, account.id, count);
    return { ok: true };
  });

  router.post('/orders/:id/status', async ({ req, params, body }) => {
    const { account } = await auth.requireAccount(req, 'rider');
    const status = v.oneOf(body.status, 'Status', ['picked_up', 'in_transit', 'delivered', 'failed']);
    const row = await repos.orders.findById(params.id);
    if (!row || row.rider_id !== account.id) throw notFound('Order not found for this rider.');

    let changed;
    if (status === 'picked_up') changed = await repos.orders.markPickedUp(params.id, account.id);
    else if (status === 'in_transit') changed = await repos.orders.markInTransit(params.id, account.id);
    else if (status === 'delivered') changed = await repos.orders.markDelivered(params.id, account.id);
    else {
      const reason = v.str(body.reason, 'Reason', { min: 3, max: 300 });
      changed = await repos.orders.markFailedByRider(params.id, account.id, reason);
    }
    if (!changed) throw badRequest(`This order cannot be marked "${status}" from "${row.status}".`);

    if (status === 'delivered' || status === 'failed') {
      dispatcher.forgetActive(account.id);
      dispatcher.riderAvailable(account.id);
    }
    const updated = await repos.orders.findById(params.id);
    return dispatcher.notifyOrder(updated);
  });
}

module.exports = { registerOrderRoutes };
