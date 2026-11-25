import mysql from 'mysql2/promise';
import env from './env.js';

// Shared connection pool. `dateStrings` returns DATE columns as 'YYYY-MM-DD'
// strings so we never fight with time zones.
export const pool = mysql.createPool({
  ...env.db,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  dateStrings: true,
});

export async function testConnection() {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
}
