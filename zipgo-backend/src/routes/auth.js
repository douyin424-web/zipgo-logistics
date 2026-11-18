'use strict';

const crypto = require('node:crypto');
const v = require('../lib/validate');
const { badRequest, tooMany, HttpError } = require('../lib/errors');
const { createLimiter } = require('../lib/rateLimit');
const whatsapp = require('../lib/whatsapp');
const { toBusiness, toRider } = require('../repos/serializers');

const ROLES = ['business', 'rider'];

function registerAuthRoutes(router, { config, repos, auth }) {
  const perPhone = createLimiter({ limit: 5, windowMs: 15 * 60000 });
  const perIp = createLimiter({ limit: 30, windowMs: 15 * 60000 });
  const verifyPerPhone = createLimiter({ limit: 15, windowMs: 15 * 60000 });

  const hashCode = (phone, role, code) =>
    crypto.createHmac('sha256', config.jwtSecret).update(`${phone}|${role}|${code}`).digest('hex');

  // Step 1: send a 6-digit code on WhatsApp
  router.post('/auth/request-otp', async ({ body, ip }) => {
    const role = v.oneOf(body.role, 'role', ROLES);
    const phone = v.phone(body.phone);
    perIp(`ip:${ip}`);
    perPhone(`otp:${phone}`, 'Too many codes requested for this number. Please wait 15 minutes.');

    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    const expiresAt = new Date(Date.now() + config.otp.ttlSeconds * 1000);
    await repos.otp.save(phone, role, hashCode(phone, role, code), expiresAt);

    let delivered = false;
    if (whatsapp.isConfigured(config.whatsapp)) {
      try {
        await whatsapp.sendLoginCode(config.whatsapp, phone, code);
        delivered = true;
      } catch (err) {
        console.error('[whatsapp]', err.message);
        if (config.isProduction) throw new HttpError(502, 'We could not send the WhatsApp code. Please try again.');
      }
    } else if (config.isProduction) {
      throw new HttpError(503, 'Login codes are not available right now. Please contact ZipGo support.');
    }

    if (!delivered) console.log(`[otp] ${role} ${phone} → ${code} (development: not sent on WhatsApp)`);

    return {
      phone,
      channel: 'whatsapp',
      expiresIn: config.otp.ttlSeconds,
      // Only outside production, so you can test without WhatsApp
      ...(config.isProduction ? {} : { devCode: config.otp.devCode || code }),
    };
  });

  // Step 2: check the code. Existing account → logged in. New number → finish sign-up.
  router.post('/auth/verify-otp', async ({ body }) => {
    const role = v.oneOf(body.role, 'role', ROLES);
    const phone = v.phone(body.phone);
    const code = String(body.code || '').trim();
    if (!/^\d{6}$/.test(code)) throw badRequest('Enter the 6-digit code.');
    verifyPerPhone(`verify:${phone}`, 'Too many attempts. Please wait 15 minutes.');

    const devOk = Boolean(config.otp.devCode) && code === config.otp.devCode;
    if (!devOk) {
      const row = await repos.otp.find(phone, role);
      if (!row || new Date(row.expires_at).getTime() < Date.now()) {
        throw badRequest('This code has expired. Please request a new one.');
      }
      if (Number(row.attempts) >= config.otp.maxAttempts) {
        await repos.otp.remove(phone, role);
        throw tooMany('Too many wrong codes. Please request a new one.');
      }
      const expected = Buffer.from(row.code_hash, 'hex');
      const given = Buffer.from(hashCode(phone, role, code), 'hex');
      if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
        await repos.otp.addAttempt(phone, role);
        throw badRequest('Invalid code. Please check and try again.');
      }
    }
    await repos.otp.remove(phone, role);

    const existing = role === 'business' ? await repos.businesses.findByPhone(phone) : await repos.riders.findByPhone(phone);
    if (existing) {
      if (role === 'rider') {
        await repos.riders.setStatus(existing.id, 'online');
        existing.status = 'online';
      }
      return {
        isNew: false,
        role,
        token: auth.issueAccess(role, existing.id, phone),
        account: role === 'business' ? toBusiness(existing) : toRider(existing),
      };
    }
    return { isNew: true, role, phone, registrationToken: auth.issueRegistration(role, phone) };
  });

  router.get('/auth/me', async ({ req }) => {
    const { role, account } = await auth.requireAccount(req);
    return { role, account: role === 'business' ? toBusiness(account) : toRider(account) };
  });
}

module.exports = { registerAuthRoutes };
