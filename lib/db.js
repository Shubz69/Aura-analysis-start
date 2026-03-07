/**
 * MySQL connection pool – same pattern as Aura FX / aura-analysis-manual.
 * Env: MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE or DATABASE_URL.
 */
const mysql = require("mysql2/promise");

let pool = null;

function getDbPool() {
  if (pool) return pool;
  if (process.env.DATABASE_URL) {
    pool = mysql.createPool(process.env.DATABASE_URL);
    return pool;
  }
  if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD || !process.env.MYSQL_DATABASE) {
    console.warn("Database credentials not found (set MYSQL_* or DATABASE_URL)");
    return null;
  }
  const connectionLimit = process.env.VERCEL ? 10 : 100;
  const queueLimit = process.env.VERCEL ? 20 : 500;
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
    waitForConnections: true,
    connectionLimit,
    queueLimit,
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ssl: process.env.MYSQL_SSL === "true" ? { rejectUnauthorized: false } : false,
  });
  return pool;
}

async function executeQuery(query, params = []) {
  const p = getDbPool();
  if (!p) return [[], []];
  const safeParams = params.map((param) => (param === undefined ? null : param));
  const [rows, fields] = await p.execute(query, safeParams);
  return [rows, fields];
}

async function query(sql, params = []) {
  const [rows] = await executeQuery(sql, params);
  return rows;
}

module.exports = { getDbPool, executeQuery, query };
