'use strict';

// Live updates over WebSocket at /ws?token=...
// Messages are JSON: { "event": "...", "data": { ... } }
//
// Server → business:  order:updated, rider:location
// Server → rider:     order:new-request, order:withdrawn, order:updated
// Rider → server:     rider:location { lat, lng, heading }
const { WebSocketServer } = require('ws');

function createRealtimeHub({ server, corsOrigins, authenticateToken, onMessage, onConnect }) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 16 * 1024 });
  const clients = new Map(); // "role:id" → Set<WebSocket>

  const keyOf = (role, id) => `${role}:${id}`;

  server.on('upgrade', async (req, socket, head) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname !== '/ws') {
      socket.destroy();
      return;
    }
    const origin = req.headers.origin;
    if (origin && !corsOrigins.includes('*') && !corsOrigins.includes(origin)) {
      socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
      socket.destroy();
      return;
    }
    let identity;
    try {
      identity = await authenticateToken(url.searchParams.get('token'));
    } catch {
      identity = null;
    }
    if (!identity) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, identity));
  });

  wss.on('connection', (ws, identity) => {
    const key = keyOf(identity.role, identity.id);
    if (!clients.has(key)) clients.set(key, new Set());
    clients.get(key).add(ws);
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (!msg || typeof msg.event !== 'string') return;
      if (msg.event === 'ping') {
        send(ws, 'pong', { at: new Date().toISOString() });
        return;
      }
      try {
        await onMessage(identity, msg.event, msg.data || {});
      } catch (err) {
        send(ws, 'error', { message: err.message || 'Message failed' });
      }
    });

    ws.on('close', () => {
      const set = clients.get(key);
      if (!set) return;
      set.delete(ws);
      if (!set.size) clients.delete(key);
    });

    send(ws, 'connected', { role: identity.role, id: identity.id });
    if (typeof onConnect === 'function') {
      try {
        onConnect(identity);
      } catch (err) {
        console.error('[realtime onConnect]', err && err.message ? err.message : err);
      }
    }
  });

  // Drop dead connections
  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.isAlive) {
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      ws.ping();
    }
  }, 30000);
  heartbeat.unref();

  function send(ws, event, data) {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ event, data }));
  }

  return {
    sendTo(role, id, event, data) {
      const set = clients.get(keyOf(role, id));
      if (!set) return 0;
      for (const ws of set) send(ws, event, data);
      return set.size;
    },
    broadcastToRole(role, event, data, exceptId = null) {
      let count = 0;
      for (const [key, set] of clients) {
        const [clientRole, clientId] = key.split(':');
        if (clientRole === role && clientId !== exceptId) {
          for (const ws of set) send(ws, event, data);
          count += set.size;
        }
      }
      return count;
    },
    isConnected: (role, id) => clients.has(keyOf(role, id)),
    close() {
      clearInterval(heartbeat);
      for (const ws of wss.clients) ws.terminate();
      wss.close();
    },
  };
}

module.exports = { createRealtimeHub };
