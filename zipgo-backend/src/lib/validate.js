'use strict';

const { badRequest } = require('./errors');

function str(value, field, { min = 1, max = 200, optional = false } = {}) {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    if (optional) return null;
    throw badRequest(`${field} is required.`);
  }
  if (typeof value !== 'string') throw badRequest(`${field} must be text.`);
  const v = value.trim();
  if (v.length < min) throw badRequest(`${field} is too short.`);
  if (v.length > max) throw badRequest(`${field} is too long (max ${max} characters).`);
  return v;
}

function number(value, field, { min = -Infinity, max = Infinity, optional = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (optional) return null;
    throw badRequest(`${field} is required.`);
  }
  const n = Number(value);
  if (!Number.isFinite(n)) throw badRequest(`${field} must be a number.`);
  if (n < min || n > max) throw badRequest(`${field} must be between ${min} and ${max}.`);
  return n;
}

function oneOf(value, field, allowed) {
  if (!allowed.includes(value)) throw badRequest(`${field} must be one of: ${allowed.join(', ')}.`);
  return value;
}

function email(value, field = 'Email') {
  const v = str(value, field, { max: 150, optional: true });
  if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw badRequest('Enter a valid email address.');
  return v;
}

// Pakistani mobile numbers → +923XXXXXXXXX
function phone(value, field = 'Phone number') {
  let p = String(value || '').replace(/[\s()-]/g, '');
  if (p.startsWith('0')) p = `+92${p.slice(1)}`;
  else if (p.startsWith('92')) p = `+${p}`;
  else if (p.startsWith('3')) p = `+92${p}`;
  if (!/^\+923\d{9}$/.test(p)) throw badRequest(`${field}: enter a valid Pakistani mobile number, e.g. 0300 1234567.`);
  return p;
}

function optionalPhone(value, field) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  return phone(value, field);
}

// 35202-1234567-1
function cnic(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length !== 13) throw badRequest('CNIC must be 13 digits, e.g. 35202-1234567-1.');
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

function point(value, field) {
  if (!value || typeof value !== 'object') throw badRequest(`${field} location is required.`);
  return {
    lat: number(value.lat, `${field} latitude`, { min: -90, max: 90 }),
    lng: number(value.lng, `${field} longitude`, { min: -180, max: 180 }),
  };
}

module.exports = { str, number, oneOf, email, phone, optionalPhone, cnic, point };
