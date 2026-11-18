'use strict';

// Database rows → JSON the portals use (camelCase).
const bool = (v) => v === true || v === 1 || v === '1';
const num = (v) => (v === null || v === undefined ? null : Number(v));

function toBusiness(r) {
  if (!r) return null;
  return {
    id: r.id,
    phone: r.phone,
    businessName: r.business_name,
    email: r.email || '',
    businessType: r.business_type,
    address: r.address,
    landmark: r.landmark || '',
    lat: num(r.lat),
    lng: num(r.lng),
    status: r.status,
    createdAt: r.created_at,
  };
}

// Full profile — only for the rider themself
function toRider(r) {
  if (!r) return null;
  return {
    id: r.id,
    phone: r.phone,
    name: r.full_name,
    email: r.email || '',
    cnic: r.cnic,
    vehicleType: r.vehicle_type,
    vehiclePlate: r.vehicle_plate,
    city: r.city,
    status: r.status,
    rating: num(r.rating),
    totalDeliveries: num(r.total_deliveries),
    lat: num(r.last_lat),
    lng: num(r.last_lng),
    locationAt: r.location_at,
    createdAt: r.created_at,
  };
}

// What a business may see about the rider carrying its order
function toPublicRider(r) {
  if (!r) return null;
  return {
    id: r.id,
    name: r.full_name,
    phone: r.phone,
    vehicleType: r.vehicle_type,
    vehiclePlate: r.vehicle_plate,
    rating: num(r.rating),
    lat: num(r.last_lat),
    lng: num(r.last_lng),
    locationAt: r.location_at,
  };
}

function toOrder(r, { hideCustomerPhone = false } = {}) {
  if (!r) return null;
  return {
    id: r.id,
    orderNumber: r.order_number,
    trackingCode: r.tracking_code || null,
    businessId: r.business_id,
    riderId: r.rider_id || null,
    clientName: r.pickup_name,
    orderType: r.order_type,
    pickupName: r.pickup_name,
    pickupAddress: r.pickup_address,
    pickupLat: num(r.pickup_lat),
    pickupLng: num(r.pickup_lng),
    dropName: r.drop_name,
    dropPhone: hideCustomerPhone ? '' : r.drop_phone || '',
    dropAddress: r.drop_address,
    dropLat: num(r.drop_lat),
    dropLng: num(r.drop_lng),
    packageDetails: r.package_details || '',
    weightKg: num(r.weight_kg) || 0,
    distanceKm: num(r.distance_km),
    durationMins: num(r.duration_mins),
    routeApproximate: bool(r.route_approximate),
    proposedFare: num(r.fare),
    finalFare: num(r.final_fare),
    peak: bool(r.is_peak),
    status: r.status,
    declineCount: num(r.decline_count),
    failureReason: r.failure_reason || null,
    createdAt: r.created_at,
    acceptedAt: r.accepted_at || null,
    pickedUpAt: r.picked_up_at || null,
    deliveredAt: r.delivered_at || null,
    cancelledAt: r.cancelled_at || null,
  };
}

function toMenuItem(r) {
  if (!r) return null;
  return {
    id: r.id,
    businessId: r.business_id,
    name: r.item_name,
    price: num(r.price),
    inStock: bool(r.in_stock),
    createdAt: r.created_at,
  };
}

module.exports = { toBusiness, toRider, toPublicRider, toOrder, toMenuItem };
