'use strict';

const fs = require('node:fs');
const path = require('node:path');

// Load .env without any extra package (Node 22+)
const envFile = path.join(__dirname, '..', '.env');
if (fs.existsSync(envFile) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envFile);
}

const env = process.env;
const num = (value, fallback) => {
  const n = Number(value);
  return value === undefined || value === '' || Number.isNaN(n) ? fallback : n;
};
const bool = (value, fallback) => (value === undefined || value === '' ? fallback : /^(1|true|yes|on)$/i.test(value));

const isProduction = env.NODE_ENV === 'production';
const dbClient = process.argv.includes('--sqlite') ? 'sqlite' : (env.DB_CLIENT || 'oracle').toLowerCase();

function parsePeakHours(text) {
  return String(text || '')
    .split(',')
    .map((part) => part.trim().split('-').map(Number))
    .filter(([from, to]) => Number.isInteger(from) && Number.isInteger(to) && from >= 0 && to <= 24 && from < to);
}

const config = {
  isProduction,
  port: num(env.PORT, 4000),
  jwtSecret: env.JWT_SECRET || '',
  corsOrigins: String(env.CORS_ORIGINS || (isProduction ? '' : '*'))
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  db: {
    client: dbClient,
    autoMigrate: bool(env.DB_AUTO_MIGRATE, true),
    oracle: {
      user: env.ORACLE_USER,
      password: env.ORACLE_PASSWORD,
      connectString: env.ORACLE_CONNECT_STRING,
      poolMax: num(env.ORACLE_POOL_MAX, 10),
      walletDir: env.ORACLE_WALLET_DIR || '',
      walletPassword: env.ORACLE_WALLET_PASSWORD || '',
    },
    sqliteFile: env.SQLITE_FILE || './data/zipgo-dev.sqlite',
  },

  otp: {
    ttlSeconds: num(env.OTP_TTL_SECONDS, 300),
    maxAttempts: 5,
    devCode: isProduction ? '' : env.OTP_DEV_CODE || '',
  },

  whatsapp: {
    token: env.WHATSAPP_TOKEN || '',
    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID || env.WHATSAPP_PHONE_ID || '',
    // template = approved Authentication template (works any time)
    // text     = plain message (only reaches numbers that messaged you in the last 24h / test numbers)
    messageType: (env.WHATSAPP_MESSAGE_TYPE || 'template').toLowerCase() === 'text' ? 'text' : 'template',
    templateName: env.WHATSAPP_TEMPLATE_NAME || 'zipgo_login_code',
    templateLang: env.WHATSAPP_TEMPLATE_LANG || 'en',
    apiVersion: env.WHATSAPP_API_VERSION || env.WHATSAPP_GRAPH_VERSION || 'v21.0',
    verifyToken: env.WHATSAPP_VERIFY_TOKEN || '',
    appSecret: env.WHATSAPP_APP_SECRET || '',
  },

  pricing: {
    baseFare: num(env.BASE_FARE, 80),
    perKm: num(env.PER_KM_RATE, 25),
    peakMultiplier: num(env.PEAK_MULTIPLIER, 1.3),
    peakHours: parsePeakHours(env.PEAK_HOURS || '12-15,19-22'),
  },
  timezone: env.APP_TIMEZONE || 'Asia/Karachi',

  dispatch: {
    radiusKm: num(env.DISPATCH_RADIUS_KM, 10),
    offerSeconds: num(env.OFFER_SECONDS, 30),
    maxDeclines: num(env.MAX_DECLINES, 3),
    pendingTimeoutSeconds: num(env.PENDING_TIMEOUT_SECONDS, 120),
    riderStaleMinutes: num(env.RIDER_STALE_MINUTES, 10),
  },

  serviceArea: {
    lat: num(env.SERVICE_CENTER_LAT, 31.5204),
    lng: num(env.SERVICE_CENTER_LNG, 74.3587),
    radiusKm: num(env.SERVICE_RADIUS_KM, 60),
  },

  osrmUrl: (env.OSRM_URL || env.OSRM_ROUTING_URL || 'https://router.project-osrm.org').replace(/\/$/, ''),
  nominatimUrl: (env.NOMINATIM_URL || env.NOMINATIM_GEOCODE_URL || 'https://nominatim.openstreetmap.org').replace(/\/$/, ''),
  // Nominatim asks every app to identify itself
  geoUserAgent: env.GEO_USER_AGENT || 'ZipGoExpress/1.0 (contactzipgopk@gmail.com)',
};

function assertConfig() {
  const problems = [];
  if (config.isProduction && config.jwtSecret.length < 32) {
    problems.push('JWT_SECRET must be set to a random value of at least 32 characters in production.');
  }
  if (config.isProduction && config.db.client !== 'oracle') {
    problems.push('Production must use DB_CLIENT=oracle.');
  }
  if (config.db.client === 'oracle') {
    const o = config.db.oracle;
    if (!o.user || !o.password || !o.connectString) {
      problems.push('Set ORACLE_USER, ORACLE_PASSWORD and ORACLE_CONNECT_STRING (or run with --sqlite to try without Oracle).');
    }
  } else if (config.db.client !== 'sqlite') {
    problems.push(`Unknown DB_CLIENT "${config.db.client}". Use oracle or sqlite.`);
  }
  if (config.isProduction && config.corsOrigins.includes('*')) {
    problems.push('CORS_ORIGINS cannot be * in production. List your website address.');
  }
  if (problems.length) {
    const err = new Error(`Configuration problem:\n - ${problems.join('\n - ')}`);
    err.isConfigError = true;
    throw err;
  }
  if (!config.jwtSecret) {
    // Development convenience only — tokens stop working after a restart.
    config.jwtSecret = require('node:crypto').randomBytes(32).toString('hex');
    console.warn('[config] JWT_SECRET is not set. Using a temporary secret (logins reset when the server restarts).');
  }
}

module.exports = { config, assertConfig };
