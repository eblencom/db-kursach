/**
 * Скрипт инициализации БД (запуск: npx ts-node scripts/init-db.ts)
 * Требует: DB_SERVER, DB_USER, DB_PASSWORD в .env.local
 */
import sql, { type ConnectionPool } from 'mssql';
import * as fs from 'fs';
import * as path from 'path';

async function runSqlFile(pool: ConnectionPool, filename: string) {
  const filePath = path.join(__dirname, '..', 'database', filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  const batches = content
    .split(/\bGO\b/i)
    .map((b) => b.trim())
    .filter(Boolean);
  for (const batch of batches) {
    if (batch) await pool.request().query(batch);
  }
  console.log(`Executed ${filename}`);
}

async function main() {
  const config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'YourPassword123',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'FinancialNewsDB',
    options: {
      encrypt: process.env.DB_ENCRYPT !== 'false',
      trustServerCertificate: true,
    },
  };

  console.log('Connecting to SQL Server...');
  const pool = await sql.connect(config);
  try {
    await runSqlFile(pool, 'schema.sql');
    await runSqlFile(pool, 'seed.sql');
    console.log('Database initialized successfully!');
  } finally {
    await pool.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
