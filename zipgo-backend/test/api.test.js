'use strict';

// End-to-end API test on an in-memory SQLite database:  npm test
process.env.NODE_ENV = 'test';
process.env.DB_CLIENT = 'sqlite';
process.env.SQLITE_FILE = ':memory:';
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-hs256-signing';
process.env.OTP_DEV_CODE = '';
process.env.OFFER_SECONDS = '1';
process.env.PENDING_TIMEOUT_SECONDS = '4';
process.env.MAX_DECLINES = '3';
process.env.CORS_ORIGINS = '*';
process.env.OSRM_URL = 'http://127.0.0.1:9';
process.env.NOMINATIM_URL = 'http://127.0.0.1:9';
process.env.WHATSAPP_VERIFY_TOKEN = 'verify-me';
process.env.WHATSAPP_APP_SECRET = 'app-secret';

const test = require('node:test');
const assert = require('node:assert/strict');
const WebSocket = require('ws');
const crypto = require('node:crypto');
const { createApp } = require('../src/server');

let app;
let base;
const logs = [];

const LAHORE_DHA = { lat: 31.4697, lng: 74.4086 };
const NEAR_DHA = { lat: 31.4751, lng: 74.4121 };
const FAR_AWAY = { lat: 31.58, lng: 74.31 }; // > 10 km from DHA
const CUSTOMER = { lat: 31.475, lng: 74.456 };

async function api(method, path, { token, body } = {}) {
  const res = await fetch(`${base}/api/v1${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  return { status: res.status, ...json };
}

// Captures console.log so the dev OTP can be read like a developer would
function lastCodeFor(phone) {
  for (let i = logs.length - 1; i >= 0; i -= 1) {
    const m = logs[i].match(/\[otp\] \w+ (\+\d+) → (\d{6})/);
    if (m && m[1] === phone) return m[2];
  }
  return null;
}

async function login(role, phone) {
  const r1 = await api('POST', '/auth/request-otp', { body: { role, phone } });
  assert.equal(r1.status, 200, JSON.stringify(r1));
  const code = r1.data.devCode;
  assert.match(code, /^\d{6}$/);
  assert.equal(code, lastCodeFor(r1.data.phone));
  const r2 = await api('POST', '/auth/verify-otp', { body: { role, phone, code } });
  assert.equal(r2.status, 200, JSON.stringify(r2));
  return r2.data;
}

function socket(token) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${base.replace('http', 'ws')}/ws?token=${token}`);
    ws.events = [];
    ws.on('message', (raw) => ws.events.push(JSON.parse(raw.toString())));
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

async function waitFor(ws, event, predicate = () => true, timeoutMs = 4000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const found = ws.events.find((e) => e.event === event && predicate(e.data));
    if (found) return found.data;
    await new Promise((r) => setTimeout(r, 25));
  }
  throw new Error(`Timed out waiting for ${event}`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const originalLog = console.log;

test.before(async () => {
  console.log = (...args) => {
    logs.push(args.join(' '));
  };
  app = await createApp();
  await new Promise((r) => app.server.listen(0, r));
  base = `http://127.0.0.1:${app.server.address().port}`;
});

test.after(async () => {
  console.log = originalLog;
  await app.close();
});

const state = {};

test('health check', async () => {
  const res = await fetch(`${base}/health`);
  const body = await res.json();
  assert.equal(body.status, 'ok');
  assert.equal(body.database, 'sqlite');
});

test('business signs up with WhatsApp code', async () => {
  const bad = await api('POST', '/auth/request-otp', { body: { role: 'business', phone: '12345' } });
  assert.equal(bad.status, 400);

  await api('POST', '/auth/request-otp', { body: { role: 'business', phone: '0300 1234567' } });
  const wrong = await api('POST', '/auth/verify-otp', { body: { role: 'business', phone: '03001234567', code: '000000' } });
  assert.equal(wrong.status, 400);

  const verified = await login('business', '0300 1234567');
  assert.equal(verified.isNew, true);
  assert.ok(verified.registrationToken);

  const missing = await api('POST', '/business/register', {
    token: verified.registrationToken,
    body: { businessName: 'ABC Restaurant', businessType: 'Restaurant', address: 'DHA Phase 5, Lahore' },
  });
  assert.equal(missing.status, 400);

  const outside = await api('POST', '/business/register', {
    token: verified.registrationToken,
    body: { businessName: 'ABC', businessType: 'Restaurant', address: 'Karachi Saddar', lat: 24.86, lng: 67.0 },
  });
  assert.equal(outside.status, 400);
  assert.match(outside.error.message, /service area/);

  const reg = await api('POST', '/business/register', {
    token: verified.registrationToken,
    body: { businessName: 'ABC Restaurant', businessType: 'Restaurant', address: 'DHA Phase 5, Lahore', ...LAHORE_DHA },
  });
  assert.equal(reg.status, 201, JSON.stringify(reg));
  assert.equal(reg.data.business.phone, '+923001234567');
  state.biz = reg.data.token;
  state.bizId = reg.data.business.id;

  // Logging in again returns the account straight away
  const again = await login('business', '03001234567');
  assert.equal(again.isNew, false);
  assert.equal(again.account.businessName, 'ABC Restaurant');

  const me = await api('GET', '/auth/me', { token: state.biz });
  assert.equal(me.data.role, 'business');

  // A registration token cannot be used as a login
  const misuse = await api('GET', '/business/me', { token: verified.registrationToken });
  assert.equal(misuse.status, 401);
});

test('riders sign up', async () => {
  const v1 = await login('rider', '0321 1111111');
  const r1 = await api('POST', '/riders/register', {
    token: v1.registrationToken,
    body: { name: 'Hassan Ali', cnic: '3520212345671', vehicleType: 'electric_bike', vehiclePlate: 'lea-1234' },
  });
  assert.equal(r1.status, 201, JSON.stringify(r1));
  assert.equal(r1.data.rider.cnic, '35202-1234567-1');
  assert.equal(r1.data.rider.vehiclePlate, 'LEA-1234');
  state.r1 = r1.data.token;
  state.r1Id = r1.data.rider.id;

  const v2 = await login('rider', '0321 2222222');
  const dup = await api('POST', '/riders/register', {
    token: v2.registrationToken,
    body: { name: 'Copy Cat', cnic: '35202-1234567-1', vehicleType: 'motorcycle', vehiclePlate: 'LEB-1' },
  });
  assert.equal(dup.status, 409);
  const r2 = await api('POST', '/riders/register', {
    token: v2.registrationToken,
    body: { name: 'Bilal Khan', cnic: '35202-7654321-3', vehicleType: 'motorcycle', vehiclePlate: 'LEB-777' },
  });
  state.r2 = r2.data.token;
  state.r2Id = r2.data.rider.id;

  const forbidden = await api('GET', '/business/dashboard', { token: state.r1 });
  assert.equal(forbidden.status, 403);
});

test('order goes to every online rider at once, and the first accept wins', async () => {
  state.ws1 = await socket(state.r1);
  state.ws2 = await socket(state.r2);
  state.wsBiz = await socket(state.biz);

  await api('PUT', '/riders/status', { token: state.r1, body: { status: 'online', ...NEAR_DHA } });
  await api('PUT', '/riders/status', { token: state.r2, body: { status: 'online', ...FAR_AWAY } });

  const est = await api('POST', '/pricing/estimate', { token: state.biz, body: { drop: CUSTOMER } });
  assert.equal(est.status, 200);
  assert.equal(est.data.approximate, true); // OSRM unreachable in the test → estimate
  const expectedBase = 80 + 25 * est.data.distanceKm;
  assert.ok([Math.round(expectedBase), Math.round(expectedBase * 1.3)].includes(est.data.fare.total));

  const created = await api('POST', '/orders', {
    token: state.biz,
    body: {
      customerName: 'Ali Ahmed',
      customerPhone: '0333 5555555',
      packageDetails: '2 burgers',
      orderType: 'restaurant',
      drop: { ...CUSTOMER, address: 'Street 4, DHA Phase 6, Lahore' },
      fare: 1, // ignored: the server sets the fare
    },
  });
  assert.equal(created.status, 201, JSON.stringify(created));
  const order = created.data;
  state.orderId = order.id;
  assert.match(order.orderNumber, /^ZG-\d{8}-0001$/);
  assert.equal(order.proposedFare, est.data.fare.total);
  assert.equal(order.status, 'pending');

  const offer1 = await waitFor(state.ws1, 'order:new-request', (d) => d.order.id === order.id);
  assert.equal(offer1.order.dropPhone, '', 'customer phone is hidden until accepted');
  // Every online rider sees the order at once, near or far
  await waitFor(state.ws2, 'order:new-request', (d) => d.order.id === order.id);

  // Rider 1 declines → the other rider still has it
  const dec = await api('POST', `/orders/${order.id}/decline`, { token: state.r1, body: { reason: 'declined' } });
  assert.equal(dec.status, 200);
  const polled = await api('GET', '/riders/requests', { token: state.r2 });
  assert.equal(polled.data.length, 1);
  const polled1 = await api('GET', '/riders/requests', { token: state.r1 });
  assert.equal(polled1.data.length, 0, 'declined rider no longer sees it');

  const cannot = await api('POST', `/orders/${order.id}/accept`, { token: state.r1 });
  assert.equal(cannot.status, 409);

  const [a, b] = await Promise.all([
    api('POST', `/orders/${order.id}/accept`, { token: state.r2 }),
    api('POST', `/orders/${order.id}/accept`, { token: state.r2 }),
  ]);
  assert.deepEqual([a.status, b.status].sort(), [200, 409]);
  const accepted = a.status === 200 ? a : b;
  assert.equal(accepted.data.order.status, 'assigned');
  assert.equal(accepted.data.order.dropPhone, '+923335555555');

  const update = await waitFor(state.wsBiz, 'order:updated', (d) => d.order.status === 'assigned');
  assert.equal(update.rider.name, 'Bilal Khan');

  const off = await api('PUT', '/riders/status', { token: state.r2, body: { status: 'offline' } });
  assert.equal(off.status, 409, 'cannot go offline during a delivery');
});

test('live location reaches the business, then pickup and delivery', async () => {
  state.ws2.send(JSON.stringify({ event: 'rider:location', data: { lat: 31.47, lng: 74.41, heading: 90 } }));
  const loc = await waitFor(state.wsBiz, 'rider:location', (d) => d.orderId === state.orderId);
  assert.equal(loc.lat, 31.47);

  const detail = await api('GET', `/orders/${state.orderId}`, { token: state.biz });
  assert.equal(detail.data.rider.lat, 31.47);
  const otherRider = await api('GET', `/orders/${state.orderId}`, { token: state.r1 });
  assert.equal(otherRider.status, 403);

  const skip = await api('POST', `/orders/${state.orderId}/status`, { token: state.r2, body: { status: 'delivered' } });
  assert.equal(skip.status, 400, 'cannot deliver before pickup');

  const picked = await api('POST', `/orders/${state.orderId}/status`, { token: state.r2, body: { status: 'picked_up' } });
  assert.equal(picked.data.order.status, 'picked_up');
  const done = await api('POST', `/orders/${state.orderId}/status`, { token: state.r2, body: { status: 'delivered' } });
  assert.equal(done.data.order.status, 'delivered');
  assert.equal(done.data.order.finalFare, done.data.order.proposedFare);

  const twice = await api('POST', `/orders/${state.orderId}/status`, { token: state.r2, body: { status: 'delivered' } });
  assert.equal(twice.status, 400);

  const earnings = await api('GET', '/riders/earnings', { token: state.r2 });
  assert.equal(earnings.data.today.deliveries, 1);
  assert.equal(earnings.data.today.total, done.data.order.finalFare);

  const me = await api('GET', '/riders/me', { token: state.r2 });
  assert.equal(me.data.totalDeliveries, 1);

  const dash = await api('GET', '/business/dashboard', { token: state.biz });
  assert.deepEqual(
    { todayOrders: dash.data.todayOrders, delivered: dash.data.delivered, inProgress: dash.data.inProgress },
    { todayOrders: 1, delivered: 1, inProgress: 0 }
  );
  assert.equal(dash.data.totalSpend, done.data.order.finalFare);

  const list = await api('GET', '/orders', { token: state.biz });
  assert.equal(list.data.orders.length, 1);
  assert.equal(list.data.riders[0].name, 'Bilal Khan');
});

test('cancel, 3 declines and timeout', async () => {
  const body = { customerName: 'Sara Khan', packageDetails: 'Docs', drop: { ...CUSTOMER, address: 'Phase 6' } };

  const o1 = (await api('POST', '/orders', { token: state.biz, body })).data;
  assert.match(o1.orderNumber, /-0002$/);
  const cancel = await api('POST', `/orders/${o1.id}/cancel`, { token: state.biz });
  assert.equal(cancel.data.status, 'cancelled');
  await waitFor(state.ws1, 'order:withdrawn', (d) => d.orderId === o1.id);

  // Three riders decline → failed
  const v3 = await login('rider', '0321 3333333');
  const r3 = await api('POST', '/riders/register', {
    token: v3.registrationToken,
    body: { name: 'Third Rider', cnic: '35202-1111111-1', vehicleType: 'electric_bike', vehiclePlate: 'LEC-3' },
  });
  await api('PUT', '/riders/status', { token: r3.data.token, body: { status: 'online', ...NEAR_DHA } });

  const o2 = (await api('POST', '/orders', { token: state.biz, body })).data;
  for (const token of [state.r1, state.r2, r3.data.token]) {
    await api('POST', `/orders/${o2.id}/decline`, { token, body: {} });
  }
  const failed = await waitFor(state.wsBiz, 'order:updated', (d) => d.order.id === o2.id && d.order.status === 'failed');
  assert.match(failed.order.failureReason, /No available riders/);

  // Timeouts do not count as declines; nobody accepts → fails after PENDING_TIMEOUT_SECONDS
  const o3 = (await api('POST', '/orders', { token: state.biz, body })).data;
  await api('POST', `/orders/${o3.id}/decline`, { token: state.r1, body: { reason: 'timeout' } });
  const after = await api('GET', `/orders`, { token: state.biz, body: undefined });
  assert.equal(after.data.orders.find((o) => o.id === o3.id).declineCount, 0);
  await sleep(4500);
  const timedOut = await waitFor(state.wsBiz, 'order:updated', (d) => d.order.id === o3.id && d.order.status === 'failed', 2000);
  assert.match(timedOut.order.failureReason, /in time/);
});

test('public tracking link, map services and nearby riders', async () => {
  const body = { customerName: 'Track Me', customerPhone: '0333 1112222', drop: { ...CUSTOMER, address: 'Phase 6' } };
  const order = (await api('POST', '/orders', { token: state.biz, body })).data;
  assert.match(order.trackingCode, /^[a-z0-9]{12}$/);

  const pub = await api('GET', `/track/${order.trackingCode}`);
  assert.equal(pub.status, 200);
  assert.equal(pub.data.status, 'pending');
  assert.equal(pub.data.businessName, 'ABC Restaurant');
  assert.equal(JSON.stringify(pub.data).includes('1112222'), false, 'customer phone never public');
  assert.equal(JSON.stringify(pub.data).includes('1234567'), false, 'business phone never public');
  assert.equal((await api('GET', '/track/zzzzzzzzzzzz')).status, 404);

  const accepted = await api('POST', `/orders/${order.id}/accept`, { token: state.r1 });
  assert.equal(accepted.status, 200, JSON.stringify(accepted));
  await api('PUT', '/riders/location', { token: state.r1, body: { lat: 31.471, lng: 74.41 } });
  const live = await api('GET', `/track/${order.trackingCode}`);
  assert.equal(live.data.status, 'assigned');
  assert.equal(live.data.rider.firstName, 'Hassan');
  assert.equal(live.data.rider.lat, 31.471);
  assert.ok(live.data.etaMins >= 1);

  const route = await api('GET', '/geo/route?from=31.4697,74.4086&to=31.475,74.456', { token: state.biz });
  assert.equal(route.data.approximate, true);
  assert.equal(route.data.coords.length, 2);
  const search = await api('GET', '/geo/search?q=DHA%20Phase%205', { token: state.biz });
  assert.deepEqual(search.data, []);
  assert.equal((await api('GET', '/geo/search?q=DHA')).status, 401, 'map services need a login');

  const nearby = await api('GET', '/geo/riders-nearby', { token: state.biz });
  assert.equal(nearby.status, 200);
  assert.ok(nearby.data.riders.length >= 1);
  assert.equal('name' in nearby.data.riders[0], false);

  await api('POST', `/orders/${order.id}/status`, { token: state.r1, body: { status: 'picked_up' } });
  await api('POST', `/orders/${order.id}/status`, { token: state.r1, body: { status: 'delivered' } });
  const done = await api('GET', `/track/${order.trackingCode}`);
  assert.equal(done.data.status, 'delivered');
  assert.equal(done.data.rider.phone, null, 'rider phone hidden after delivery');
  assert.equal(done.data.rider.lat, null);
});

test('WhatsApp webhook', async () => {
  const ok = await fetch(`${base}/api/v1/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=42`);
  assert.equal(ok.status, 200);
  assert.equal(await ok.text(), '42');
  const bad = await fetch(`${base}/api/v1/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=nope&hub.challenge=42`);
  assert.equal(bad.status, 403);

  const payload = JSON.stringify({ entry: [{ changes: [{ value: { statuses: [{ status: 'delivered', recipient_id: '923001234567' }] } }] }] });
  const sig = `sha256=${crypto.createHmac('sha256', 'app-secret').update(payload).digest('hex')}`;
  const post = await fetch(`${base}/api/v1/webhooks/whatsapp`, { method: 'POST', headers: { 'x-hub-signature-256': sig }, body: payload });
  assert.equal(post.status, 200);
  await sleep(50);
  assert.ok(logs.some((l) => l.includes('message delivered to 923001234567')));
  await fetch(`${base}/api/v1/webhooks/whatsapp`, { method: 'POST', headers: { 'x-hub-signature-256': 'sha256=bad' }, body: payload });
  await sleep(50);
  assert.equal(logs.filter((l) => l.includes('message delivered to 923001234567')).length, 1, 'bad signature ignored');
});

test('menu items and support', async () => {
  const add = await api('POST', '/business/menu', { token: state.biz, body: { name: 'Zinger Burger', price: 550 } });
  assert.equal(add.status, 201);
  const toggled = await api('PATCH', `/business/menu/${add.data.id}`, { token: state.biz, body: { inStock: false } });
  assert.equal(toggled.data.inStock, false);
  assert.equal(toggled.data.price, 550);
  const list = await api('GET', '/business/menu', { token: state.biz });
  assert.equal(list.data.length, 1);
  const del = await api('DELETE', `/business/menu/${add.data.id}`, { token: state.biz });
  assert.equal(del.data.deleted, true);

  const ticket = await api('POST', '/business/support', { token: state.biz, body: { message: 'Rider was late on ZG-0001' } });
  assert.equal(ticket.status, 201);

  for (const ws of [state.ws1, state.ws2, state.wsBiz]) ws.close();
});

test('bad tokens and unknown routes', async () => {
  assert.equal((await api('GET', '/riders/me', { token: 'abc.def.ghi' })).status, 401);
  assert.equal((await api('GET', '/riders/me')).status, 401);
  assert.equal((await api('GET', '/nope')).status, 404);
  const ws = new WebSocket(`${base.replace('http', 'ws')}/ws?token=bad`);
  const code = await new Promise((resolve) => ws.on('unexpected-response', (_, res) => resolve(res.statusCode)));
  assert.equal(code, 401);
});
