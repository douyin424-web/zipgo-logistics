'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { config, assertConfig } = require('./config');
const { connectDatabase } = require('./db');
const { createRepos } = require('./repos');
const { Router, createHandler } = require('./lib/http');
const { createAuth } = require('./services/auth');
const { createDispatcher } = require('./services/dispatch');
const { createRealtimeHub } = require('./services/realtime');
const { registerAuthRoutes } = require('./routes/auth');
const { registerBusinessRoutes } = require('./routes/business');
const { registerRiderRoutes } = require('./routes/riders');
const { registerOrderRoutes } = require('./routes/orders');
const { registerGeoRoutes } = require('./routes/geo');
const { registerTrackRoutes } = require('./routes/track');
const { createWebhookHandler } = require('./routes/webhooks');
const { createGeoServices } = require('./lib/geoServices');

const DIST_DIRS = [
  path.resolve(__dirname, '../../dist'),
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, '../dist'),
];
const DIST_DIR = DIST_DIRS.find((d) => fs.existsSync(d)) || DIST_DIRS[0];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

function serveStatic(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;
  if (!fs.existsSync(DIST_DIR)) return false;

  const urlPath = req.url.split('?')[0];
  let filePath = path.join(DIST_DIR, urlPath);

  // Security check: prevent directory traversal
  if (!filePath.startsWith(DIST_DIR)) return false;

  let stat = null;
  try {
    stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      stat = fs.statSync(filePath);
    }
  } catch {
    // If requesting an SPA route without a dot in the last segment (e.g. /business, /rider, /track/...)
    // serve index.html
    const lastSegment = urlPath.split('/').pop() || '';
    if (!lastSegment.includes('.')) {
      filePath = path.join(DIST_DIR, 'index.html');
      try {
        stat = fs.statSync(filePath);
      } catch {
        return false;
      }
    } else {
      return false;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const isHashed = urlPath.startsWith('/assets/');

  res.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': stat.size,
    'Cache-Control': isHashed ? 'public, max-age=31536000, immutable' : 'no-cache, must-revalidate',
  });

  if (req.method === 'HEAD') {
    res.end();
    return true;
  }

  fs.createReadStream(filePath).pipe(res);
  return true;
}

async function createApp(overrides = {}) {
  Object.assign(config, overrides);
  assertConfig();

  const db = await connectDatabase(config.db);
  const repos = createRepos(db);
  const auth = createAuth({ config, repos });

  const router = new Router('/api/v1');
  const server = http.createServer();

  // The dispatcher needs the hub and the hub needs the dispatcher — wire lazily
  let dispatcher;
  const hub = createRealtimeHub({
    server,
    corsOrigins: config.corsOrigins,
    authenticateToken: auth.identifyToken,
    onConnect: async (identity) => {
      if (identity.role === 'rider' && dispatcher) {
        await dispatcher.riderAvailable(identity.id);
      }
    },
    onMessage: async (identity, event, data) => {
      if (event === 'rider:location' && identity.role === 'rider') {
        const lat = Number(data.lat);
        const lng = Number(data.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return;
        await dispatcher.updateLocation(identity.id, lat, lng, data.heading);
      }
    },
  });
  dispatcher = createDispatcher({ repos, config, hub });

  const geo = createGeoServices(config);
  const deps = { config, repos, auth, dispatcher, hub, geo };
  registerAuthRoutes(router, deps);
  registerBusinessRoutes(router, deps);
  registerRiderRoutes(router, deps);
  registerOrderRoutes(router, deps);
  registerGeoRoutes(router, deps);
  registerTrackRoutes(router, deps);

  const apiHandler = createHandler({ router, corsOrigins: config.corsOrigins, context: {} });
  const webhookHandler = createWebhookHandler(config);

  server.on('request', async (req, res) => {
    const reqPath = req.url.split('?')[0];
    if (reqPath === '/health') {
      let dbOk = true;
      try {
        await db.ping();
      } catch {
        dbOk = false;
      }
      const body = JSON.stringify({ status: dbOk ? 'ok' : 'degraded', service: 'ZipGo Unified Server', database: db.dialect, dbOk, time: new Date().toISOString() });
      res.writeHead(dbOk ? 200 : 503, { 'Content-Type': 'application/json' });
      res.end(body);
      return;
    }

    if (reqPath.startsWith('/api/v1/')) {
      if (await webhookHandler(req, res)) return;
      apiHandler(req, res);
      return;
    }

    if (await webhookHandler(req, res)) return;

    // Single-Host: Serve Website & Portals
    if (serveStatic(req, res)) return;

    apiHandler(req, res);
  });

  await dispatcher.start();

  async function close() {
    dispatcher.stop();
    hub.close();
    await new Promise((resolve) => server.close(resolve));
    await db.close();
  }

  return { server, db, close };
}

if (require.main === module) {
  createApp()
    .then(({ server, db, close }) => {
      server.listen(config.port, () => {
        console.log(`ZipGo API running on http://localhost:${config.port}  (database: ${db.dialect}, ${config.isProduction ? 'production' : 'development'})`);
        console.log(`Health check: http://localhost:${config.port}/health`);
      });
      const shutdown = async (signal) => {
        console.log(`${signal} received, shutting down…`);
        try {
          await close();
        } finally {
          process.exit(0);
        }
      };
      process.on('SIGINT', () => shutdown('SIGINT'));
      process.on('SIGTERM', () => shutdown('SIGTERM'));
    })
    .catch((err) => {
      console.error(err.isConfigError ? err.message : err);
      process.exit(1);
    });
}

module.exports = { createApp };
