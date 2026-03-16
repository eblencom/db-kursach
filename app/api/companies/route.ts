import { NextResponse } from 'next/server';
import { getDb, sql } from '@/lib/db';
import { mockCompanies } from '@/lib/mock-data';

const USE_MOCK = process.env.USE_MOCK_DATA === 'true' || !process.env.DB_SERVER;

export async function GET() {
  if (!USE_MOCK) {
    try {
      const pool = await getDb();
      const result = await pool.request().query(`
        SELECT id, name, ticker, sector FROM Companies ORDER BY name
      `);
      return NextResponse.json(result.recordset);
    } catch (err) {
      console.warn('DB error, using mock data:', err);
    }
  }
  return NextResponse.json(mockCompanies);
}
