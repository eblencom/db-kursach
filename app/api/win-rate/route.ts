import { NextResponse } from 'next/server';
import { mockNews, mockCompanies, getMockStockPrices } from '@/lib/mock-data';
import { getDb, sql } from '@/lib/db';

const USE_MOCK = process.env.USE_MOCK_DATA === 'true' || !process.env.DB_SERVER;

function isPositive(sentiment: number | null): boolean {
  return sentiment != null && sentiment > 0.5;
}
function isNegative(sentiment: number | null): boolean {
  return sentiment != null && sentiment < -0.3;
}

async function computeWinRateFromDb(): Promise<{ correct: number; incorrect: number }> {
  const pool = await getDb();
  const newsResult = await pool.request().query(`
    SELECT n.id, n.published_at, n.sentiment,
           STRING_AGG(CAST(nc.company_id AS NVARCHAR(10)), ',') as company_ids
    FROM News n
    LEFT JOIN NewsCompanies nc ON n.id = nc.news_id
    GROUP BY n.id, n.published_at, n.sentiment
  `);

  let correct = 0;
  let incorrect = 0;

  for (const row of newsResult.recordset as Record<string, unknown>[]) {
    const sentiment = row.sentiment as number | null;
    if (!isPositive(sentiment) && !isNegative(sentiment)) continue;

    const companyIds = (row.company_ids as string || '')
      .split(',')
      .filter(Boolean)
      .map((x) => parseInt(x.trim(), 10))
      .filter((n) => !isNaN(n));

    const newsDate = new Date((row.published_at as string)).toISOString().split('T')[0];
    const nextDate = new Date(newsDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    for (const companyId of companyIds) {
      const req = pool.request();
      req.input('companyId', sql.Int, companyId);
      req.input('fromDate', sql.Date, newsDate);
      req.input('nextDate', sql.Date, nextDateStr);
      const pricesResult = await req.query(`
        SELECT price_date, close_price FROM StockPrices
        WHERE company_id = @companyId AND price_date >= @fromDate AND price_date <= @nextDate
        ORDER BY price_date
      `);
      const prices = (pricesResult.recordset as { price_date: Date; close_price: number }[]).map(
        (p) => ({
          date: new Date(p.price_date).toISOString().split('T')[0],
          close: p.close_price,
        })
      );
      if (prices.length < 2) continue;
      const day0 = prices.find((p) => p.date === newsDate)?.close;
      const day1 = prices.find((p) => p.date === nextDateStr)?.close;
      if (day0 == null || day1 == null) continue;
      const priceUp = day1 > day0;
      if (isPositive(sentiment)) {
        if (priceUp) correct++;
        else incorrect++;
      } else {
        if (!priceUp) correct++;
        else incorrect++;
      }
    }
  }
  return { correct, incorrect };
}

function computeWinRateFromMock(): { correct: number; incorrect: number } {
  let correct = 0;
  let incorrect = 0;

  for (const news of mockNews) {
    const sentiment = news.sentiment;
    if (!isPositive(sentiment) && !isNegative(sentiment)) continue;

    const companyIds = news.company_ids || [];
    const newsDate = new Date(news.published_at).toISOString().split('T')[0];
    const nextDate = new Date(newsDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    for (const companyId of companyIds) {
      const prices = getMockStockPrices(companyId);
      const day0 = prices.find((p) => p.date === newsDate)?.close;
      const day1 = prices.find((p) => p.date === nextDateStr)?.close;
      if (day0 == null || day1 == null) continue;
      const priceUp = day1 > day0;
      if (isPositive(sentiment)) {
        if (priceUp) correct++;
        else incorrect++;
      } else {
        if (!priceUp) correct++;
        else incorrect++;
      }
    }
  }
  return { correct, incorrect };
}

export async function GET() {
  try {
    let correct = 0;
    let incorrect = 0;

    if (!USE_MOCK) {
      const result = await computeWinRateFromDb();
      correct = result.correct;
      incorrect = result.incorrect;
    } else {
      const result = computeWinRateFromMock();
      correct = result.correct;
      incorrect = result.incorrect;
    }

    const total = correct + incorrect;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return NextResponse.json({
      correct,
      incorrect,
      total,
      percentage,
    });
  } catch (err) {
    console.error('Win rate error:', err);
    return NextResponse.json(
      { error: 'Failed to compute win rate', correct: 0, incorrect: 0, total: 0, percentage: 0 },
      { status: 500 }
    );
  }
}
