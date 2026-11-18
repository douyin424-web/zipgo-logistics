'use strict';

// Meta WhatsApp webhook (moved from the old map backend):
//   GET  /api/v1/webhooks/whatsapp  — verification handshake (WHATSAPP_VERIFY_TOKEN)
//   POST /api/v1/webhooks/whatsapp  — message status updates, checked with WHATSAPP_APP_SECRET
const crypto = require('node:crypto');

const PATH = '/api/v1/webhooks/whatsapp';

function readRaw(req, limit = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function validSignature(appSecret, raw, header) {
  if (!appSecret) return true; // not configured yet
  if (!header) return false;
  const expected = Buffer.from(`sha256=${crypto.createHmac('sha256', appSecret).update(raw).digest('hex')}`);
  const given = Buffer.from(String(header));
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

function createWebhookHandler(config) {
  const wa = config.whatsapp;
  return async function handle(req, res) {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.replace(/\/$/, '') !== PATH) return false;

    if (req.method === 'GET') {
      const ok =
        url.searchParams.get('hub.mode') === 'subscribe' &&
        wa.verifyToken &&
        url.searchParams.get('hub.verify_token') === wa.verifyToken &&
        url.searchParams.get('hub.challenge');
      res.writeHead(ok ? 200 : 403, { 'Content-Type': 'text/plain' });
      res.end(ok ? url.searchParams.get('hub.challenge') : 'Verification failed');
      if (ok) console.log('[whatsapp] webhook verified by Meta');
      return true;
    }

    if (req.method === 'POST') {
      let raw;
      try {
        raw = await readRaw(req);
      } catch {
        res.writeHead(413);
        res.end();
        return true;
      }
      // Always answer 200 quickly, otherwise Meta keeps retrying
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"received":true}');

      if (!validSignature(wa.appSecret, raw, req.headers['x-hub-signature-256'])) {
        console.warn('[whatsapp] webhook ignored: bad signature');
        return true;
      }
      let payload;
      try {
        payload = JSON.parse(raw.toString('utf8'));
      } catch {
        return true;
      }
      for (const entry of payload.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value || {};
          for (const s of value.statuses || []) {
            const error = s.errors && s.errors[0] ? ` — error ${s.errors[0].code}: ${s.errors[0].title}` : '';
            console.log(`[whatsapp] message ${s.status} to ${s.recipient_id}${error}`);
          }
          for (const m of value.messages || []) {
            console.log(`[whatsapp] message from ${m.from}: ${m.type}`);
          }
        }
      }
      return true;
    }

    res.writeHead(405);
    res.end();
    return true;
  };
}

module.exports = { createWebhookHandler };
