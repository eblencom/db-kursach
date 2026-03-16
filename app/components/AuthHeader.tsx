'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export function AuthHeader() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-600/50" />
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-slate-700/50 px-4 py-2">
          <span className="text-sm font-medium text-white">
            {session.user.name}
          </span>
          {(session.user as { role?: string }).role && (
            <span className="rounded-lg bg-slate-600 px-2 py-0.5 text-xs font-medium text-slate-200">
              {(session.user as { role?: string }).role}
            </span>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="rounded-xl border border-slate-500 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
        >
          Выйти
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Link
        href="/login"
        className="rounded-xl border border-slate-500 bg-transparent px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-600"
      >
        Вход
      </Link>
      <Link
        href="/register"
        className="rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-600"
      >
        Регистрация
      </Link>
    </div>
  );
}
