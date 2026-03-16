import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { mockUsers } from '@/lib/mock-data';

const USE_MOCK = process.env.USE_MOCK_DATA === 'true' || !process.env.DB_SERVER;

export async function GET() {
  if (!USE_MOCK) {
    try {
      const pool = await getDb();
      const result = await pool.request().query(`
        SELECT u.id, u.email, u.full_name, r.name as role
        FROM Users u
        JOIN Roles r ON u.role_id = r.id
        ORDER BY u.id
      `);
      return NextResponse.json(result.recordset);
    } catch (err) {
      console.warn('DB error, using mock data:', err);
    }
  }
  return NextResponse.json(mockUsers);
}
