'use strict';

// Tiny HTTP framework: routing, JSON bodies, CORS and errors — no Express needed.
const { HttpError, badRequest, notFound } = require('./errors');

const MAX_BODY_BYTES = 100 * 1024;

// Return created(data) from a handler to answer 201 instead of 200
class Reply {
  constructor(status, data) {
    this.status = status;
    this.data = data;
  }
}
const created = (data) => new Reply(201, data);

class Router {
  constructor(prefix = '') {
    this.prefix = prefix;
    this.routes = [];
  }

  add(method, pattern, handler) {
    const keys = [];
    const source = (this.prefix + pattern)
      .replace(/\/+$/, '')
      .replace(/:([a-zA-Z]+)/g, (_, key) => {
        keys.push(key);
        return '([^/]+)';
      });
    this.routes.push({ method, regex: new RegExp(`^${source || '/'}/?$`), keys, handler });
  }

  get(p, h) { this.add('GET', p, h); }
  post(p, h) { this.add('POST', p, h); }
  put(p, h) { this.add('PUT', p, h); }
  patch(p, h) { this.add('PATCH', p, h); }
  delete(p, h) { this.add('DELETE', p, h); }

  match(method, pathname) {
    let pathMatched = false;
    for (const route of this.routes) {
      const m = route.regex.exec(pathname);
      if (!m) continue;
      pathMatched = true;
      if (route.method !== method) continue;
      const params = {};
      route.keys.forEach((key, i) => {
        params[key] = decodeURIComponent(m[i + 1]);
      });
      return { handler: route.handler, params };
    }
    return pathMatched ? { methodNotAllowed: true } : null;
  }
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    if (req.method === 'GET' || req.method === 'DELETE' || req.method === 'OPTIONS') return resolve({});
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new HttpError(413, 'Request is too large.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (body === null || typeof body !== 'object' || Array.isArray(body)) {
          return reject(badRequest('Request body must be a JSON object.'));
        }
        resolve(body);
      } catch {
        reject(badRequest('Request body is not valid JSON.'));
      }
    });
    req.on('error', reject);
  });
}

function send(res, status, payload, extraHeaders = {}) {
  if (res.headersSent) return;
  const body = payload === undefined ? '' : JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...extraHeaders,
  });
  res.end(body);
}

function corsHeaders(origin, allowed) {
  if (!origin) return {};
  const ok = allowed.includes('*') || allowed.includes(origin);
  if (!ok) return {};
  return {
    'Access-Control-Allow-Origin': allowed.includes('*') ? '*' : origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  };
}

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-store',
};

function createHandler({ router, corsOrigins, context }) {
  return async (req, res) => {
    const started = Date.now();
    const url = new URL(req.url, 'http://localhost');
    const headers = { ...SECURITY_HEADERS, ...corsHeaders(req.headers.origin, corsOrigins) };
    for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);

    res.on('finish', () => {
      if (url.pathname !== '/health') {
        console.log(`${req.method} ${url.pathname} ${res.statusCode} ${Date.now() - started}ms`);
      }
    });

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      const found = router.match(req.method, url.pathname);
      if (!found) throw notFound('This API route does not exist.');
      if (found.methodNotAllowed) throw new HttpError(405, 'Method not allowed.');

      const body = await readJson(req);
      // Behind Cloudflare the real visitor address is in CF-Connecting-IP
      const ip =
        String(req.headers['cf-connecting-ip'] || '').trim() ||
        (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
        req.socket.remoteAddress ||
        '';
      const result = await found.handler({
        req,
        params: found.params,
        query: Object.fromEntries(url.searchParams),
        body,
        ip,
        ...context,
      });
      const wrapped = result instanceof Reply;
      send(res, wrapped ? result.status : 200, { success: true, data: wrapped ? result.data : result ?? null });
    } catch (err) {
      if (err instanceof HttpError) {
        send(res, err.status, { success: false, error: { message: err.message, code: err.code } });
      } else {
        console.error(`[error] ${req.method} ${url.pathname}`, err);
        send(res, 500, { success: false, error: { message: 'Something went wrong on our side. Please try again.', code: 'server_error' } });
      }
    }
  };
}

module.exports = { Router, createHandler, send, created };
