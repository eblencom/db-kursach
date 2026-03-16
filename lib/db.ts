import sql, { type config, type ConnectionPool } from 'mssql';

const dbConfig: config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourPassword123',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'FinancialNewsDB',
  options: {
    encrypt: process.env.DB_ENCRYPT !== 'false',
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: ConnectionPool | null = null;

export async function getDb(): Promise<ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(dbConfig);
  }
  return pool;
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

export { sql };
