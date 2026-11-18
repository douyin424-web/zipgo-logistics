'use strict';

// Local development database (a single file). Not for production.
const fs = require('node:fs');
const path = require('node:path');
const { pickBinds, normalizeRow } = require('./common');
const { schemaStatements } = require('./schema');

function createSqliteAdapter(file) {
  let DatabaseSync;
  try {
    ({ DatabaseSync } = require('node:sqlite'));
  } catch {
    throw new Error('SQLite mode needs Node.js 22.5 or newer.');
  }

  if (file !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');

  // SQLite has no date type: store ISO strings
  const prepareBinds = (sql, binds) => {
    const out = pickBinds(sql, binds);
    for (const key of Object.keys(out)) {
      if (out[key] instanceof Date) out[key] = out[key].toISOString();
    }
    return out;
  };

  const runner = {
    async all(sql, binds) {
      return db.prepare(sql).all(prepareBinds(sql, binds)).map(normalizeRow);
    },
    async get(sql, binds) {
      return normalizeRow(db.prepare(sql).get(prepareBinds(sql, binds)) || null);
    },
    async run(sql, binds) {
      const result = db.prepare(sql).run(prepareBinds(sql, binds));
      return { changes: Number(result.changes) };
    },
  };

  let queue = Promise.resolve();

  return {
    dialect: 'sqlite',
    ...runner,
    limit: (n) => ` LIMIT ${Math.max(1, Math.floor(n))}`,

    transaction(fn) {
      const work = queue.then(async () => {
        db.exec('BEGIN IMMEDIATE');
        try {
          const result = await fn(runner);
          db.exec('COMMIT');
          return result;
        } catch (err) {
          db.exec('ROLLBACK');
          throw err;
        }
      });
      queue = work.catch(() => {});
      return work;
    },

    isUniqueViolation: (err) => Boolean(err) && /UNIQUE constraint failed/i.test(err.message || ''),

    async ping() {
      db.prepare('SELECT 1').get();
    },

    async migrate() {
      for (const sql of schemaStatements('sqlite')) {
        try {
          db.exec(sql);
        } catch (err) {
          if (!/duplicate column name/i.test(err.message)) throw err;
        }
      }
    },

    async close() {
      db.close();
    },
  };
}

module.exports = { createSqliteAdapter };
