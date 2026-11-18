'use strict';

const { created } = require('../lib/http');
const v = require('../lib/validate');
const { conflict } = require('../lib/errors');
const { startOfDay } = require('../lib/time');
const { toRider, toOrder } = require('../repos/serializers');

const VEHICLES = ['electric_bike', 'motorcycle'];

function registerRiderRoutes(router, { config, repos, auth, dispatcher }) {
  router.post('/riders/register', async ({ req, body }) => {
    const { phone } = auth.requireRegistration(req, 'rider');
    const fields = {
      name: v.str(body.name, 'Full name', { min: 2, max: 120 }),
      email: v.email(body.email),
      cnic: v.cnic(body.cnic),
      vehicleType: v.oneOf(body.vehicleType, 'Vehicle', VEHICLES),
      vehiclePlate: v.str(body.vehiclePlate, 'Number plate', { min: 2, max: 20 }).toUpperCase(),
    };

    let row = await repos.riders.findByPhone(phone);
    if (!row) {
      const sameCnic = await repos.riders.findByCnic(fields.cnic);
      if (sameCnic) throw conflict('A rider account with this CNIC already exists.');
      row = await repos.riders.create({ phone, ...fields });
    }
    return created({ token: auth.issueAccess('rider', row.id, phone), rider: toRider(row) });
  });

  router.get('/riders/me', async ({ req }) => {
    const { account } = await auth.requireAccount(req, 'rider');
    return toRider(account);
  });

  router.put('/riders/status', async ({ req, body }) => {
    const { account } = await auth.requireAccount(req, 'rider');
    const status = v.oneOf(body.status, 'Status', ['online', 'offline']);
    if (status === 'offline' && (await repos.orders.activeForRider(account.id))) {
      throw conflict('Finish your current delivery before going offline.');
    }
    await repos.riders.setStatus(account.id, status);
    if (status === 'online') {
      if (body.lat !== undefined && body.lng !== undefined) {
        const p = v.point({ lat: body.lat, lng: body.lng }, 'Your');
        await dispatcher.updateLocation(account.id, p.lat, p.lng);
      }
      dispatcher.riderAvailable(account.id);
    } else {
      await dispatcher.riderOffline(account.id);
    }
    return toRider(await repos.riders.findById(account.id));
  });

  // HTTP fallback — the app normally sends this over the WebSocket
  router.put('/riders/location', async ({ req, body }) => {
    const { account } = await auth.requireAccount(req, 'rider');
    const p = v.point(body, 'Your');
    await dispatcher.updateLocation(account.id, p.lat, p.lng, body.heading);
    return { ok: true };
  });

  router.get('/riders/orders', async ({ req }) => {
    const { account } = await auth.requireAccount(req, 'rider');
    return (await repos.orders.listForRider(account.id)).map((row) => toOrder(row));
  });

  // Delivery requests waiting for this rider (polling fallback for the WebSocket)
  router.get('/riders/requests', async ({ req }) => {
    const { account } = await auth.requireAccount(req, 'rider');
    if (account.status !== 'online') return [];
    if (await repos.orders.activeForRider(account.id)) return [];
    return dispatcher.requestsFor(account.id);
  });

  router.get('/riders/earnings', async ({ req }) => {
    const { account } = await auth.requireAccount(req, 'rider');
    const tz = config.timezone;
    const [today, week, month] = await Promise.all([
      repos.earnings.summary(account.id, startOfDay(tz, 0)),
      repos.earnings.summary(account.id, startOfDay(tz, 6)),
      repos.earnings.summary(account.id, startOfDay(tz, 29)),
    ]);
    return { today, week, month };
  });
}

module.exports = { registerRiderRoutes };
