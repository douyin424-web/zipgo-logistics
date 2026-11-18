'use strict';

// A database created before tracking links existed is upgraded on start.
const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');
const { createSqliteAdapter } = require('../src/db/sqlite');

test('adds new columns to an existing database', async () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'zipgo-')), 'old.sqlite');

  // Build a database the way the first release did (no tracking_code)
  let db = createSqliteAdapter(file);
  await db.migrate();
  await db.run('DROP INDEX ux_orders_tracking');
  await db.run('ALTER TABLE orders DROP COLUMN tracking_code');
  await db.close();

  db = createSqliteAdapter(file);
  await db.migrate();
  await db.migrate(); // running twice is safe
  const cols = (await db.all('PRAGMA table_info(orders)')).map((c) => c.name);
  assert.ok(cols.includes('tracking_code'));
  await db.close();
});
