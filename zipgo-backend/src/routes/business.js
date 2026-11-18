'use strict';

const { created } = require('../lib/http');
const v = require('../lib/validate');
const { badRequest, notFound } = require('../lib/errors');
const { haversineKm } = require('../lib/geo');
const { startOfDay } = require('../lib/time');
const { toBusiness, toMenuItem } = require('../repos/serializers');

const BUSINESS_TYPES = ['Restaurant', 'E-commerce', 'Courier Service', 'Other'];

function checkServiceArea(config, point, label) {
  const area = config.serviceArea;
  if (!area.radiusKm) return;
  if (haversineKm(point, { lat: area.lat, lng: area.lng }) > area.radiusKm) {
    throw badRequest(`${label} is outside the ZipGo service area.`);
  }
}

function readBusinessFields(body, config) {
  const location = v.point({ lat: body.lat, lng: body.lng }, 'Business');
  checkServiceArea(config, location, 'Your business address');
  return {
    businessName: v.str(body.businessName, 'Business name', { min: 2, max: 150 }),
    email: v.email(body.email),
    businessType: v.oneOf(body.businessType, 'Business type', BUSINESS_TYPES),
    address: v.str(body.address, 'Address', { min: 5, max: 500 }),
    landmark: v.str(body.landmark, 'Landmark', { max: 200, optional: true }),
    lat: location.lat,
    lng: location.lng,
  };
}

function registerBusinessRoutes(router, { config, repos, auth }) {
  // Finish sign-up after the phone number is verified
  router.post('/business/register', async ({ req, body }) => {
    const { phone } = auth.requireRegistration(req, 'business');
    const fields = readBusinessFields(body, config);

    let row = await repos.businesses.findByPhone(phone);
    if (!row) {
      try {
        row = await repos.businesses.create({ phone, ...fields });
      } catch (err) {
        row = await repos.businesses.findByPhone(phone); // created by a parallel request
        if (!row) throw err;
      }
    }
    return created({ token: auth.issueAccess('business', row.id, phone), business: toBusiness(row) });
  });

  router.get('/business/me', async ({ req }) => {
    const { account } = await auth.requireAccount(req, 'business');
    return toBusiness(account);
  });

  router.put('/business/me', async ({ req, body }) => {
    const { account } = await auth.requireAccount(req, 'business');
    return toBusiness(await repos.businesses.update(account.id, readBusinessFields(body, config)));
  });

  router.get('/business/dashboard', async ({ req }) => {
    const { account } = await auth.requireAccount(req, 'business');
    return repos.orders.businessStats(account.id, startOfDay(config.timezone));
  });

  // ───────────── menu items
  router.get('/business/menu', async ({ req }) => {
    const { account } = await auth.requireAccount(req, 'business');
    return (await repos.menu.list(account.id)).map(toMenuItem);
  });

  router.post('/business/menu', async ({ req, body }) => {
    const { account } = await auth.requireAccount(req, 'business');
    const name = v.str(body.name, 'Item name', { max: 150 });
    const price = v.number(body.price, 'Price', { min: 0, max: 10000000 });
    return created(toMenuItem(await repos.menu.create(account.id, name, price)));
  });

  router.patch('/business/menu/:id', async ({ req, params, body }) => {
    const { account } = await auth.requireAccount(req, 'business');
    const item = await repos.menu.find(params.id, account.id);
    if (!item) throw notFound('Menu item not found.');
    const updated = await repos.menu.update(params.id, account.id, {
      name: body.name === undefined ? item.item_name : v.str(body.name, 'Item name', { max: 150 }),
      price: body.price === undefined ? Number(item.price) : v.number(body.price, 'Price', { min: 0, max: 10000000 }),
      inStock: body.inStock === undefined ? Number(item.in_stock) : body.inStock ? 1 : 0,
    });
    return toMenuItem(updated);
  });

  router.delete('/business/menu/:id', async ({ req, params }) => {
    const { account } = await auth.requireAccount(req, 'business');
    if (!(await repos.menu.remove(params.id, account.id))) throw notFound('Menu item not found.');
    return { deleted: true };
  });

  // ───────────── support
  router.post('/business/support', async ({ req, body }) => {
    const { account } = await auth.requireAccount(req, 'business');
    const message = v.str(body.message, 'Message', { min: 5, max: 2000 });
    const ticket = await repos.support.create(account.id, message);
    console.log(`[support] ticket ${ticket.id} from ${account.business_name} (${account.phone})`);
    return created(ticket);
  });
}

module.exports = { registerBusinessRoutes, checkServiceArea };
