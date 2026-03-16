import { NextResponse } from 'next/server';
import { getDb, sql } from '@/lib/db';
import { mockNews, mockNewsSources, mockCompanies } from '@/lib/mock-data';

const USE_MOCK = process.env.USE_MOCK_DATA === 'true' || !process.env.DB_SERVER;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('company_id');
  const sourceId = searchParams.get('source_id');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  if (!USE_MOCK) {
    try {
      const pool = await getDb();
      let query = `
        SELECT n.id, n.title, n.content, n.url, n.published_at, n.sentiment, n.created_at,
               ns.name as source_name,
               STRING_AGG(CAST(c.name AS NVARCHAR(MAX)), N', ') as companies,
               STRING_AGG(CAST(nc.company_id AS NVARCHAR(10)), N',') as company_ids
        FROM News n
        JOIN NewsSources ns ON n.source_id = ns.id
        LEFT JOIN NewsCompanies nc ON n.id = nc.news_id
        LEFT JOIN Companies c ON nc.company_id = c.id
        WHERE 1=1
      `;
      if (companyId) query += ` AND n.id IN (SELECT news_id FROM NewsCompanies WHERE company_id = @companyId)`;
      if (sourceId) query += ` AND n.source_id = @sourceId`;
      query += ` GROUP BY n.id, n.title, n.content, n.url, n.published_at, n.sentiment, n.created_at, ns.name`;
      query += ` ORDER BY n.published_at DESC OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY`;

      const req = pool.request();
      if (companyId) req.input('companyId', sql.Int, parseInt(companyId, 10));
      if (sourceId) req.input('sourceId', sql.Int, parseInt(sourceId, 10));
      req.input('limit', sql.Int, limit);
      const result = await req.query(query);
      return NextResponse.json(result.recordset);
    } catch (err) {
      console.warn('DB error, using mock data:', err);
    }
  }

  // Mock data fallback
  let news = [...mockNews];
  if (companyId) {
    const cid = parseInt(companyId, 10);
    news = news.filter((n) => n.company_ids?.includes(cid));
  }
  if (sourceId) {
    const sid = parseInt(sourceId, 10);
    news = news.filter((n) => n.source_id === sid);
  }
  news = news.slice(0, limit);

  const newsWithSources = news.map((n) => {
    const source = mockNewsSources.find((s) => s.id === n.source_id);
    const companies = (n.company_ids || [])
      .map((cid) => mockCompanies.find((c) => c.id === cid)?.name)
      .filter(Boolean)
      .join(', ');
    return {
      id: n.id,
      title: n.title,
      content: n.content,
      published_at: n.published_at,
      sentiment: n.sentiment,
      source_name: source?.name || '',
      companies,
      company_ids: n.company_ids || [],
    };
  });

  return NextResponse.json(newsWithSources);
}
