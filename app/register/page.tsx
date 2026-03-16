'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка регистрации');
        setLoading(false);
        return;
      }
      router.push('/login?registered=1');
      router.refresh();
    } catch {
      setError('Ошибка соединения');
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
            <h1 className="text-2xl font-bold text-slate-800">Регистрация</h1>
            <p className="mt-1 text-sm text-slate-500">
              Новые пользователи получают роль <strong className="text-teal-700">аналитик</strong>
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5 p-8">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-slate-700">
                ФИО
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Иванов Иван"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder-slate-400 transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder-slate-400 transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Минимум 6 символов"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder-slate-400 transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          <div className="space-y-3 border-t border-slate-100 px-8 py-8">
            <p className="text-center text-sm text-slate-500">
              Уже есть аккаунт?{' '}
              <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-700">
                Войти
              </Link>
            </p>
            <p className="text-center">
              <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">← На главную</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
