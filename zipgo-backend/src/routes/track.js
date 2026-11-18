'use strict';

// Public order tracking for the customer: /api/v1/track/:code
// The link is secret (12 random characters). No phone numbers of the business
// or the customer are shown; the rider's number only while the order is active.
const { notFound } = require('../lib/errors');
const { createLimiter } = require('../lib/rateLimit');
const { haversineKm } = require('../lib/geo');

const ACTIVE = ['assigned', 'picked_up', 'in_transit'];
const SHOW_HOURS_AFTER_FINISH = 24;

function registerTrackRoutes(router, { repos, dispatcher }) {
  const perIp = createLimiter({ limit: 120, windowMs: 60000 });

  router.get('/track/:code', async ({ params, ip }) => {
    perIp(`track:${ip}`);
    const code = String(params.code || '').toLowerCase();
    if (!/^[a-z0-9]{8,16}$/.test(code)) throw notFound('Tracking link not found.');
    const row = await repos.orders.findByTrackingCode(code);
    if (!row) throw notFound('Tracking link not found.');

    const finishedAt = row.delivered_at || row.cancelled_at || (['failed', 'cancelled', 'delivered'].includes(row.status) ? row.updated_at : null);
    if (finishedAt && Date.now() - new Date(finishedAt).getTime() > SHOW_HOURS_AFTER_FINISH * 3600000) {
      throw notFound('This tracking link has expired.');
    }

    const active = ACTIVE.includes(row.status);
    let rider = null;
    let etaMins = null;
    if (row.rider_id) {
      const r = dispatcher.publicRider(await repos.riders.findById(row.rider_id));
      if (r) {
        rider = {
          firstName: String(r.name || '').split(' ')[0],
          vehicleType: r.vehicleType,
          vehiclePlate: r.vehiclePlate,
          rating: r.rating,
          phone: active ? r.phone : null,
          lat: active ? r.lat : null,
          lng: active ? r.lng : null,
          locationAt: active ? r.locationAt : null,
        };
        if (active && r.lat != null) {
          const target =
            row.status === 'assigned'
              ? { lat: Number(row.pickup_lat), lng: Number(row.pickup_lng) }
              : { lat: Number(row.drop_lat), lng: Number(row.drop_lng) };
          etaMins = Math.max(1, Math.ceil(((haversineKm({ lat: r.lat, lng: r.lng }, target) * 1.3) / 22) * 60));
          if (row.status === 'assigned') etaMins += Number(row.duration_mins) || 0;
        }
      }
    }

    return {
      orderNumber: row.order_number,
      status: row.status,
      businessName: row.pickup_name,
      pickup: { name: row.pickup_name, address: row.pickup_address, lat: Number(row.pickup_lat), lng: Number(row.pickup_lng) },
      drop: { name: row.drop_name, address: row.drop_address, lat: Number(row.drop_lat), lng: Number(row.drop_lng) },
      packageDetails: row.package_details || '',
      distanceKm: Number(row.distance_km),
      etaMins,
      rider,
      failureReason: row.status === 'failed' ? row.failure_reason : null,
      createdAt: row.created_at,
      acceptedAt: row.accepted_at || null,
      pickedUpAt: row.picked_up_at || null,
      deliveredAt: row.delivered_at || null,
    };
  });
}

module.exports = { registerTrackRoutes };
