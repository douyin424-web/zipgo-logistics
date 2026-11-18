'use strict';

// Tokens and "who is calling" checks.
const jwt = require('../lib/jwt');
const { unauthorized, forbidden } = require('../lib/errors');

const ACCESS_TTL = 30 * 24 * 3600; // 30 days
const REGISTER_TTL = 30 * 60; // 30 minutes to finish sign-up

function createAuth({ config, repos }) {
  const secret = () => config.jwtSecret;

  const issueAccess = (role, id, phone) => jwt.sign({ typ: 'access', role, sub: id, phone }, secret(), ACCESS_TTL);
  const issueRegistration = (role, phone) => jwt.sign({ typ: 'register', role, phone }, secret(), REGISTER_TTL);

  function bearer(req) {
    const header = req.headers.authorization || '';
    const match = /^Bearer\s+(.+)$/i.exec(header);
    return match ? match[1].trim() : null;
  }

  async function loadAccount(role, id) {
    if (role === 'business') {
      const b = await repos.businesses.findById(id);
      return b && b.status === 'active' ? b : null;
    }
    if (role === 'rider') {
      const r = await repos.riders.findById(id);
      return r && Number(r.is_active) === 1 ? r : null;
    }
    return null;
  }

  // Logged-in business or rider
  async function requireAccount(req, role) {
    const claims = jwt.verify(bearer(req), secret());
    if (!claims || claims.typ !== 'access') throw unauthorized();
    if (role && claims.role !== role) throw forbidden(`This needs a ${role} account.`);
    const account = await loadAccount(claims.role, claims.sub);
    if (!account) throw unauthorized('Your account was not found or is disabled. Please log in again.');
    return { role: claims.role, account };
  }

  // Verified phone that has not created an account yet
  function requireRegistration(req, role) {
    const claims = jwt.verify(bearer(req), secret());
    if (!claims || claims.typ !== 'register' || claims.role !== role) {
      throw unauthorized('Your verification expired. Please verify your phone number again.');
    }
    return { phone: claims.phone };
  }

  // For WebSocket connections
  async function identifyToken(token) {
    const claims = jwt.verify(token, secret());
    if (!claims || claims.typ !== 'access') return null;
    const account = await loadAccount(claims.role, claims.sub);
    return account ? { role: claims.role, id: account.id } : null;
  }

  return { issueAccess, issueRegistration, requireAccount, requireRegistration, identifyToken };
}

module.exports = { createAuth };
