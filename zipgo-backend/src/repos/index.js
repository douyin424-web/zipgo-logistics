'use strict';

const crypto = require('node:crypto');

const newId = () => crypto.randomUUID();
// Short secret code for the public tracking link (no look-alike characters)
const TRACK_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';
const newTrackingCode = () => Array.from(crypto.randomBytes(12), (b) => TRACK_CHARS[b % TRACK_CHARS.length]).join('');
const ACTIVE = ['assigned', 'picked_up', 'in_transit'];

function createRepos(db) {
  // ───────────────────────────── businesses
  const businesses = {
    findById: (id) => db.get('SELECT * FROM businesses WHERE id = :id', { id }),
    findByPhone: (phone) => db.get('SELECT * FROM businesses WHERE phone = :phone', { phone }),

    async create(d) {
      const now = new Date();
      const id = newId();
      await db.run(
        `INSERT INTO businesses (id, phone, business_name, email, business_type, address, landmark, lat, lng, status, created_at, updated_at)
         VALUES (:id, :phone, :businessName, :email, :businessType, :address, :landmark, :lat, :lng, 'active', :now, :now)`,
        { id, ...d, now }
      );
      return businesses.findById(id);
    },

    async update(id, d) {
      await db.run(
        `UPDATE businesses SET business_name = :businessName, email = :email, business_type = :businessType,
           address = :address, landmark = :landmark, lat = :lat, lng = :lng, updated_at = :now
         WHERE id = :id`,
        { id, ...d, now: new Date() }
      );
      return businesses.findById(id);
    },
  };

  // ───────────────────────────── riders
  const riders = {
    findById: (id) => db.get('SELECT * FROM riders WHERE id = :id', { id }),
    findByPhone: (phone) => db.get('SELECT * FROM riders WHERE phone = :phone', { phone }),
    findByCnic: (cnic) => db.get('SELECT id FROM riders WHERE cnic = :cnic', { cnic }),

    async create(d) {
      const now = new Date();
      const id = newId();
      await db.run(
        `INSERT INTO riders (id, phone, full_name, email, cnic, vehicle_type, vehicle_plate, city, status, rating,
           total_deliveries, is_active, created_at, updated_at)
         VALUES (:id, :phone, :name, :email, :cnic, :vehicleType, :vehiclePlate, 'Lahore', 'online', 5, 0, 1, :now, :now)`,
        { id, ...d, now }
      );
      return riders.findById(id);
    },

    setStatus: (id, status) =>
      db.run('UPDATE riders SET status = :status, updated_at = :now WHERE id = :id', { id, status, now: new Date() }),

    setLocation: (id, lat, lng, at = new Date()) =>
      db.run('UPDATE riders SET last_lat = :lat, last_lng = :lng, location_at = :at WHERE id = :id', { id, lat, lng, at }),

    listOnline: () => db.all("SELECT * FROM riders WHERE status = 'online' AND is_active = 1"),

    async goOfflineIfStale(cutoff) {
      const stale = await db.all(
        "SELECT id FROM riders WHERE status = 'online' AND (location_at IS NULL OR location_at < :cutoff) AND updated_at < :cutoff",
        { cutoff }
      );
      for (const r of stale) await riders.setStatus(r.id, 'offline');
      return stale.map((r) => r.id);
    },
  };

  // ───────────────────────────── orders
  const orders = {
    findById: (id) => db.get('SELECT * FROM orders WHERE id = :id', { id }),

    async nextOrderNumber(day) {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          const value = await db.transaction(async (tx) => {
            const updated = await tx.run(
              'UPDATE daily_counters SET last_value = last_value + 1 WHERE counter_day = :day',
              { day }
            );
            if (!updated.changes) {
              await tx.run('INSERT INTO daily_counters (counter_day, last_value) VALUES (:day, 1)', { day });
            }
            const row = await tx.get('SELECT last_value FROM daily_counters WHERE counter_day = :day', { day });
            return Number(row.last_value);
          });
          return `ZG-${day}-${String(value).padStart(4, '0')}`;
        } catch (err) {
          if (!db.isUniqueViolation(err)) throw err;
        }
      }
      throw new Error('Could not create an order number');
    },

    async create(d) {
      const now = new Date();
      const id = newId();
      await db.run(
        `INSERT INTO orders (id, order_number, tracking_code, business_id, order_type, pickup_name, pickup_address, pickup_lat, pickup_lng,
           drop_name, drop_phone, drop_address, drop_lat, drop_lng, package_details, weight_kg, distance_km, duration_mins,
           route_approximate, fare, is_peak, status, decline_count, created_at, updated_at)
         VALUES (:id, :orderNumber, :trackingCode, :businessId, :orderType, :pickupName, :pickupAddress, :pickupLat, :pickupLng,
           :dropName, :dropPhone, :dropAddress, :dropLat, :dropLng, :packageDetails, :weightKg, :distanceKm, :durationMins,
           :routeApproximate, :fare, :isPeak, 'pending', 0, :now, :now)`,
        { id, trackingCode: newTrackingCode(), ...d, now }
      );
      return orders.findById(id);
    },

    findByTrackingCode: (code) => db.get('SELECT * FROM orders WHERE tracking_code = :code', { code }),

    listForBusiness(businessId, status, limit = 200) {
      if (status) {
        return db.all(
          `SELECT * FROM orders WHERE business_id = :businessId AND status = :status ORDER BY created_at DESC${db.limit(limit)}`,
          { businessId, status }
        );
      }
      return db.all(`SELECT * FROM orders WHERE business_id = :businessId ORDER BY created_at DESC${db.limit(limit)}`, {
        businessId,
      });
    },

    listForRider: (riderId, limit = 200) =>
      db.all(`SELECT * FROM orders WHERE rider_id = :riderId ORDER BY created_at DESC${db.limit(limit)}`, { riderId }),

    activeForRider: (riderId) =>
      db.get(
        "SELECT * FROM orders WHERE rider_id = :riderId AND status IN ('assigned', 'picked_up', 'in_transit')",
        { riderId }
      ),

    activeRiderIds: async () =>
      (await db.all("SELECT rider_id FROM orders WHERE status IN ('assigned', 'picked_up', 'in_transit')")).map((r) => r.rider_id),

    listPending: () => db.all("SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at"),

    // Atomic: only one rider can win
    async accept(id, riderId) {
      const now = new Date();
      const result = await db.run(
        `UPDATE orders SET status = 'assigned', rider_id = :riderId, accepted_at = :now, updated_at = :now
         WHERE id = :id AND status = 'pending'`,
        { id, riderId, now }
      );
      return result.changes === 1;
    },

    async cancel(id, businessId) {
      const now = new Date();
      const result = await db.run(
        `UPDATE orders SET status = 'cancelled', cancelled_at = :now, updated_at = :now
         WHERE id = :id AND business_id = :businessId AND status = 'pending'`,
        { id, businessId, now }
      );
      return result.changes === 1;
    },

    async failIfPending(id, reason) {
      const result = await db.run(
        "UPDATE orders SET status = 'failed', failure_reason = :reason, updated_at = :now WHERE id = :id AND status = 'pending'",
        { id, reason, now: new Date() }
      );
      return result.changes === 1;
    },

    async markPickedUp(id, riderId) {
      const now = new Date();
      const result = await db.run(
        `UPDATE orders SET status = 'picked_up', picked_up_at = :now, updated_at = :now
         WHERE id = :id AND rider_id = :riderId AND status = 'assigned'`,
        { id, riderId, now }
      );
      return result.changes === 1;
    },

    async markInTransit(id, riderId) {
      const result = await db.run(
        `UPDATE orders SET status = 'in_transit', updated_at = :now
         WHERE id = :id AND rider_id = :riderId AND status = 'picked_up'`,
        { id, riderId, now: new Date() }
      );
      return result.changes === 1;
    },

    async markFailedByRider(id, riderId, reason) {
      const result = await db.run(
        `UPDATE orders SET status = 'failed', failure_reason = :reason, updated_at = :now
         WHERE id = :id AND rider_id = :riderId AND status IN ('assigned', 'picked_up', 'in_transit')`,
        { id, riderId, reason, now: new Date() }
      );
      return result.changes === 1;
    },

    // Delivered + rider earning + delivery count, all or nothing
    markDelivered(id, riderId) {
      return db.transaction(async (tx) => {
        const now = new Date();
        const updated = await tx.run(
          `UPDATE orders SET status = 'delivered', delivered_at = :now, final_fare = fare, updated_at = :now
           WHERE id = :id AND rider_id = :riderId AND status IN ('picked_up', 'in_transit')`,
          { id, riderId, now }
        );
        if (updated.changes !== 1) return false;
        const order = await tx.get('SELECT fare FROM orders WHERE id = :id', { id });
        await tx.run(
          'INSERT INTO earnings (id, rider_id, order_id, amount, created_at) VALUES (:eid, :riderId, :id, :amount, :now)',
          { eid: newId(), riderId, id, amount: Number(order.fare), now }
        );
        await tx.run('UPDATE riders SET total_deliveries = total_deliveries + 1, updated_at = :now WHERE id = :riderId', {
          riderId,
          now,
        });
        return true;
      });
    },

    // Returns the decline count after this decline (timeouts are not counted)
    async addDecline(orderId, riderId, reason) {
      try {
        await db.run(
          'INSERT INTO order_declines (order_id, rider_id, reason, created_at) VALUES (:orderId, :riderId, :reason, :now)',
          { orderId, riderId, reason, now: new Date() }
        );
      } catch (err) {
        if (!db.isUniqueViolation(err)) throw err;
        return null; // already declined
      }
      if (reason !== 'timeout') {
        await db.run(
          "UPDATE orders SET decline_count = decline_count + 1, updated_at = :now WHERE id = :orderId AND status = 'pending'",
          { orderId, now: new Date() }
        );
      }
      const row = await db.get('SELECT decline_count FROM orders WHERE id = :orderId', { orderId });
      return row ? Number(row.decline_count) : null;
    },

    declinedRiderIds: async (orderId) =>
      (await db.all('SELECT rider_id FROM order_declines WHERE order_id = :orderId', { orderId })).map((r) => r.rider_id),

    async businessStats(businessId, since) {
      const row = await db.get(
        `SELECT
           SUM(CASE WHEN created_at >= :since THEN 1 ELSE 0 END) AS today_orders,
           SUM(CASE WHEN status IN ('pending', 'assigned', 'picked_up', 'in_transit') THEN 1 ELSE 0 END) AS in_progress,
           SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
           SUM(CASE WHEN status = 'delivered' THEN final_fare ELSE 0 END) AS total_spend
         FROM orders WHERE business_id = :businessId`,
        { businessId, since }
      );
      return {
        todayOrders: Number(row.today_orders || 0),
        inProgress: Number(row.in_progress || 0),
        delivered: Number(row.delivered || 0),
        totalSpend: Number(row.total_spend || 0),
      };
    },
  };

  // ───────────────────────────── earnings
  const earnings = {
    async summary(riderId, since) {
      const row = await db.get(
        'SELECT COUNT(*) AS deliveries, SUM(amount) AS total FROM earnings WHERE rider_id = :riderId AND created_at >= :since',
        { riderId, since }
      );
      const deliveries = Number(row.deliveries || 0);
      const total = Number(row.total || 0);
      return { deliveries, total, average: deliveries ? Math.round(total / deliveries) : 0 };
    },
  };

  // ───────────────────────────── menu items
  const menu = {
    list: (businessId) =>
      db.all('SELECT * FROM menu_items WHERE business_id = :businessId ORDER BY created_at DESC', { businessId }),
    find: (id, businessId) =>
      db.get('SELECT * FROM menu_items WHERE id = :id AND business_id = :businessId', { id, businessId }),

    async create(businessId, name, price) {
      const id = newId();
      const now = new Date();
      await db.run(
        `INSERT INTO menu_items (id, business_id, item_name, price, in_stock, created_at, updated_at)
         VALUES (:id, :businessId, :name, :price, 1, :now, :now)`,
        { id, businessId, name, price, now }
      );
      return menu.find(id, businessId);
    },

    async update(id, businessId, d) {
      await db.run(
        `UPDATE menu_items SET item_name = :name, price = :price, in_stock = :inStock, updated_at = :now
         WHERE id = :id AND business_id = :businessId`,
        { id, businessId, ...d, now: new Date() }
      );
      return menu.find(id, businessId);
    },

    async remove(id, businessId) {
      const result = await db.run('DELETE FROM menu_items WHERE id = :id AND business_id = :businessId', { id, businessId });
      return result.changes === 1;
    },
  };

  // ───────────────────────────── login codes
  const otp = {
    save(phone, role, codeHash, expiresAt) {
      return db.transaction(async (tx) => {
        await tx.run('DELETE FROM otp_codes WHERE phone = :phone AND user_role = :role', { phone, role });
        await tx.run(
          `INSERT INTO otp_codes (phone, user_role, code_hash, attempts, expires_at, created_at)
           VALUES (:phone, :role, :codeHash, 0, :expiresAt, :now)`,
          { phone, role, codeHash, expiresAt, now: new Date() }
        );
      });
    },
    find: (phone, role) => db.get('SELECT * FROM otp_codes WHERE phone = :phone AND user_role = :role', { phone, role }),
    addAttempt: (phone, role) =>
      db.run('UPDATE otp_codes SET attempts = attempts + 1 WHERE phone = :phone AND user_role = :role', { phone, role }),
    remove: (phone, role) => db.run('DELETE FROM otp_codes WHERE phone = :phone AND user_role = :role', { phone, role }),
    removeExpired: () => db.run('DELETE FROM otp_codes WHERE expires_at < :now', { now: new Date() }),
  };

  // ───────────────────────────── support
  const support = {
    async create(businessId, message) {
      const id = newId();
      await db.run(
        "INSERT INTO support_tickets (id, business_id, message, status, created_at) VALUES (:id, :businessId, :message, 'open', :now)",
        { id, businessId, message, now: new Date() }
      );
      return { id };
    },
  };

  return { businesses, riders, orders, earnings, menu, otp, support, ACTIVE };
}

module.exports = { createRepos };
