'use strict';

// In-memory fixed-window limiter (fine for a single server).
const { tooMany } = require('./errors');

function createLimiter({ limit, windowMs }) {
  const hits = new Map();
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
  }, windowMs);
  timer.unref();

  return function check(key, message) {
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > limit) throw tooMany(message);
  };
}

module.exports = { createLimiter };
