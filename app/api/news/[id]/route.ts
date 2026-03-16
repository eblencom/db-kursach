import { NextResponse } from 'next/server';
import { getDb, sql } from '@/lib/db';
import { mockNews } from '@/lib/mock-data';

const USE_MOCK = process.env.USE_MOCK_DATA === 'true' || !process.env.DB_SERVER;

const mutableMockNews = [...mockNews];

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const newsId = parseInt(id, 10);

  if (!USE_MOCK) {
    try {
      const pool = await getDb();
      await pool
        .request()
        .input('id', sql.Int, newsId)
        .query('DELETE FROM News WHERE id = @id');
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error('Delete news error:', err);
      return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 });
    }
  }

  const idx = mutableMockNews.findIndex((n) => n.id === newsId);
  if (idx === -1) return NextResponse.json({ error: 'Новость не найдена' }, { status: 404 });
  mutableMockNews.splice(idx, 1);
  return NextResponse.json({ success: true });
}
