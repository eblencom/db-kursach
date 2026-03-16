import { NextResponse } from 'next/server';
import { getDb, sql } from '@/lib/db';
import { mockUsers } from '@/lib/mock-data';

const USE_MOCK = process.env.USE_MOCK_DATA === 'true' || !process.env.DB_SERVER;

// Мутабельная копия для mock-режима
const mutableMockUsers = [...mockUsers];

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = parseInt(id, 10);

  if (!USE_MOCK) {
    try {
      const pool = await getDb();
      await pool
        .request()
        .input('id', sql.Int, userId)
        .query('DELETE FROM Users WHERE id = @id');
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error('Delete user error:', err);
      return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 });
    }
  }

  const idx = mutableMockUsers.findIndex((u) => u.id === userId);
  if (idx === -1) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  mutableMockUsers.splice(idx, 1);
  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = parseInt(id, 10);
  const body = await request.json();
  const { role } = body as { role: string };

  if (!role || !['admin', 'analyst'].includes(role)) {
    return NextResponse.json({ error: 'Неверная роль' }, { status: 400 });
  }

  if (!USE_MOCK) {
    try {
      const pool = await getDb();
      await pool
        .request()
        .input('id', sql.Int, userId)
        .input('role', sql.NVarChar(50), role)
        .query(`
          UPDATE Users SET role_id = (SELECT id FROM Roles WHERE name = @role)
          WHERE id = @id
        `);
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error('Update role error:', err);
      return NextResponse.json({ error: 'Ошибка обновления роли' }, { status: 500 });
    }
  }

  const user = mutableMockUsers.find((u) => u.id === userId);
  if (!user) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  user.role = role;
  return NextResponse.json({ success: true, user });
}
