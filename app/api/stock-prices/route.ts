import { NextResponse } from 'next/server';
import { getDb, sql } from '@/lib/db';
import { getMockStockPrices } from '@/lib/mock-data';

const USE_MOCK = process.env.USE_MOCK_DATA === 'true' || !process.env.DB_SERVER;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('company_id');
  const fromDate = searchParams.get('from');
  const toDate = searchParams.get('to');

  if (!companyId) {
    return NextResponse.json({ error: 'company_id required' }, { status: 400 });
  }

  if (!USE_MOCK) {
    try {
      const pool = await getDb();
      const req = pool.request();
      req.input('companyId', sql.Int, parseInt(companyId, 10));
      let query = `
        SELECT id, company_id, price_date, open_price, high_price, low_price, close_price, volume
        FROM StockPrices WHERE company_id = @companyId
      `;
      if (fromDate) {
        req.input('fromDate', sql.Date, fromDate);
        query += ` AND price_date >= @fromDate`;
      }
      if (toDate) {
        req.input('toDate', sql.Date, toDate);
        query += ` AND price_date <= @toDate`;
      }
      query += ` ORDER BY price_date ASC`;
      const result = await req.query(query);
      const records = (result.recordset as Record<string, unknown>[]).map((r) => ({
        id: r.id,
        company_id: r.company_id,
        date: r.price_date,
        open: r.open_price,
        high: r.high_price,
        low: r.low_price,
        close: r.close_price,
        volume: r.volume,
      }));
      return NextResponse.json(records);
    } catch (err) {
      console.warn('DB error, using mock data:', err);
    }
  }

  let prices = getMockStockPrices(parseInt(companyId, 10));
  if (fromDate) prices = prices.filter((p) => p.date >= fromDate);
  if (toDate) prices = prices.filter((p) => p.date <= toDate);
  const records = prices.map((p, i) => ({
    id: i + 1,
    company_id: parseInt(companyId, 10),
    date: p.date,
    open: p.open,
    high: p.high,
    low: p.low,
    close: p.close,
    volume: p.volume,
  }));
  return NextResponse.json(records);
}
