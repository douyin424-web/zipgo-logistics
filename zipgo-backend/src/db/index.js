'use strict';

const { createOracleAdapter } = require('./oracle');
const { createSqliteAdapter } = require('./sqlite');

async function connectDatabase(dbConfig) {
  const db =
    dbConfig.client === 'oracle'
      ? await createOracleAdapter(dbConfig.oracle)
      : createSqliteAdapter(dbConfig.sqliteFile);

  await db.ping();
  if (dbConfig.autoMigrate) await db.migrate();
  return db;
}

module.exports = { connectDatabase };
