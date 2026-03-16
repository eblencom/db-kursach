'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const registered = searchParams.get('registered') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError('Неверный email или пароль');
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError('Ошибка входа');
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-6">
            <h1 className="text-2xl font-bold text-slate-800">Вход в аккаунт</h1>
            <p className="mt-1 text-sm text-slate-500">
              Введите данные для входа в систему
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5 p-8">
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            {registered && (
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Регистрация успешна. Войдите в аккаунт.
              </div>
            )}
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
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
          <div className="space-y-3 border-t border-slate-100 px-8 py-8">
            <p className="text-center text-sm text-slate-500">
              Нет аккаунта?{' '}
              <Link href="/register" className="font-semibold text-teal-600 hover:text-teal-700">
                Зарегистрироваться
              </Link>
            </p>
            <p className="text-center text-xs text-slate-400">
              Демо: analyst@finance.ru / password123
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
