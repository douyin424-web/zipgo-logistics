'use strict';

const { pickBinds, normalizeRow } = require('./common');
const { schemaStatements } = require('./schema');

// ORA codes that just mean "this already exists" when creating the schema
// 1430 = column being added already exists
const ALREADY_EXISTS = new Set([955, 1408, 1430, 2260, 2261, 2275]);

async function createOracleAdapter(options) {
  let oracledb;
  try {
    oracledb = require('oracledb');
  } catch {
    throw new Error('The "oracledb" package is not installed. Run "npm install" in the backend folder.');
  }

  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
  oracledb.fetchAsString = [oracledb.CLOB];

  const poolOptions = {
    user: options.user,
    password: options.password,
    connectString: options.connectString,
    poolMin: 1,
    poolMax: options.poolMax,
    poolIncrement: 1,
    poolTimeout: 60,
  };
  if (options.walletDir) {
    poolOptions.configDir = options.walletDir;
    poolOptions.walletLocation = options.walletDir;
    if (options.walletPassword) poolOptions.walletPassword = options.walletPassword;
  }

  const pool = await oracledb.createPool(poolOptions);

  // A "runner" executes statements on one connection
  const makeRunner = (getConnection, autoCommit) => {
    const exec = async (sql, binds) => {
      const conn = await getConnection();
      try {
        return await conn.execute(sql, pickBinds(sql, binds), { autoCommit });
      } finally {
        if (autoCommit) await conn.close();
      }
    };
    return {
      async all(sql, binds) {
        const result = await exec(sql, binds);
        return (result.rows || []).map(normalizeRow);
      },
      async get(sql, binds) {
        const result = await exec(sql, binds);
        return result.rows && result.rows.length ? normalizeRow(result.rows[0]) : null;
      },
      async run(sql, binds) {
        const result = await exec(sql, binds);
        return { changes: result.rowsAffected || 0 };
      },
    };
  };

  const base = makeRunner(() => pool.getConnection(), true);

  return {
    dialect: 'oracle',
    ...base,

    limit: (n) => ` FETCH FIRST ${Math.max(1, Math.floor(n))} ROWS ONLY`,

    async transaction(fn) {
      const conn = await pool.getConnection();
      try {
        const tx = makeRunner(async () => conn, false);
        const result = await fn(tx);
        await conn.commit();
        return result;
      } catch (err) {
        await conn.rollback().catch(() => {});
        throw err;
      } finally {
        await conn.close();
      }
    },

    isUniqueViolation: (err) => Boolean(err) && (err.errorNum === 1 || /ORA-00001/.test(err.message || '')),

    async ping() {
      await base.get('SELECT 1 AS ok FROM dual');
    },

    async migrate() {
      const conn = await pool.getConnection();
      try {
        for (const sql of schemaStatements('oracle')) {
          try {
            await conn.execute(sql);
          } catch (err) {
            if (!ALREADY_EXISTS.has(err.errorNum)) throw err;
          }
        }
      } finally {
        await conn.close();
      }
    },

    async close() {
      await pool.close(10);
    },
  };
}

module.exports = { createOracleAdapter };
