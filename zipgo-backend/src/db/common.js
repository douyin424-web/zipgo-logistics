'use strict';

// Shared helpers for both database adapters.

// Only pass the binds the SQL actually uses (Oracle rejects unknown bind names).
function pickBinds(sql, binds = {}) {
  const used = new Set();
  for (const match of sql.matchAll(/:([a-zA-Z_][a-zA-Z0-9_]*)/g)) used.add(match[1]);
  const out = {};
  for (const name of used) {
    if (!(name in binds)) throw new Error(`Missing bind value for :${name}`);
    out[name] = normalizeBind(binds[name]);
  }
  return out;
}

function normalizeBind(value) {
  if (value === undefined) return null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  return value;
}

// Lower-case column names and turn Date objects into ISO strings
function normalizeRow(row) {
  if (!row) return null;
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    out[key.toLowerCase()] = value instanceof Date ? value.toISOString() : value;
  }
  return out;
}

module.exports = { pickBinds, normalizeRow };
