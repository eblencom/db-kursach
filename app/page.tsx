'use client';

import { useEffect, useState } from 'react';
import { NewsPriceChart } from './components/NewsPriceChart';
import { WinRateChart } from './components/WinRateChart';
import { AuthHeader } from './components/AuthHeader';

type NewsItem = {
  id: number;
  title: string;
  content: string;
  published_at: string;
  sentiment: number | null;
  source_name: string;
  companies: string;
  company_ids?: number[] | string;
};

type Company = { id: number; name: string; ticker: string; sector: string };
type User = { id: number; email: string; full_name: string; role: string };

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCompany, setFilterCompany] = useState<string>('');

  useEffect(() => {
    Promise.all([
      fetch('/api/news').then((r) => r.json()),
      fetch('/api/companies').then((r) => r.json()),
      fetch('/api/users').then((r) => r.json()),
    ])
      .then(([newsData, companiesData, usersData]) => {
        setNews(newsData);
        setCompanies(companiesData);
        setUsers(usersData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!filterCompany) return;
    fetch(`/api/news?company_id=${filterCompany}`)
      .then((r) => r.json())
      .then(setNews)
      .catch(console.error);
  }, [filterCompany]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('ru-RU', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  const sentimentLabel = (s: number | null) => {
    if (s == null) return '—';
    if (s > 0.5) return 'Позитив';
    if (s < -0.3) return 'Негатив';
    return 'Нейтрал';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
          <p className="text-slate-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Анализ финансовых новостей
              </h1>
              <p className="mt-2 text-slate-300">
                Программное средство для автоматизации анализа финансовых новостей
              </p>
              <div className="mt-5 flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-600/50 px-2.5 py-0.5 text-sm font-medium">
                    {users.length}
                  </span>
                  <span className="text-sm text-slate-400">пользователей</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-600/50 px-2.5 py-0.5 text-sm font-medium">
                    {companies.length}
                  </span>
                  <span className="text-sm text-slate-400">компаний</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-600/50 px-2.5 py-0.5 text-sm font-medium">
                    {news.length}
                  </span>
                  <span className="text-sm text-slate-400">новостей</span>
                </div>
              </div>
            </div>
            <AuthHeader />
          </div>
        </header>

        {/* Toolbar + Win Rate */}
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-stretch">
          <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="text-sm font-semibold text-slate-700">
              Фильтр по компании
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="">Все новости</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.ticker})
                  </option>
                ))}
              </select>
              <a
                href="/api/stock-prices?company_id=1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
              >
                API котировок →
              </a>
            </div>
          </div>
          <div className="lg:w-80">
            <WinRateChart />
          </div>
        </div>

        {/* News feed */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-800">
            Лента новостей
          </h2>
          <div className="space-y-5">
            {news.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md hover:border-slate-300/80"
              >
                <div className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold leading-snug text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
                        {item.content}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="font-medium text-slate-600">{item.source_name}</span>
                        <span>{formatDate(item.published_at)}</span>
                        {item.companies && (
                          <span className="text-slate-400">• {item.companies}</span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 self-start rounded-full px-3 py-1.5 text-xs font-semibold ${
                        (item.sentiment ?? 0) > 0.5
                          ? 'bg-emerald-100 text-emerald-800'
                          : (item.sentiment ?? 0) < -0.3
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {sentimentLabel(item.sentiment)}
                    </span>
                  </div>
                  {(() => {
                    const ids = Array.isArray(item.company_ids)
                      ? item.company_ids
                      : (item.company_ids || '')
                          .toString()
                          .split(',')
                          .filter(Boolean)
                          .map(Number);
                    if (ids.length === 0) return null;
                    return (
                      <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-3">
                        {ids.map((cid) => {
                          const company = companies.find((c) => c.id === cid);
                          if (!company) return null;
                          return (
                            <NewsPriceChart
                              key={cid}
                              companyId={company.id}
                              companyName={company.name}
                              ticker={company.ticker}
                              newsPublishedAt={item.published_at}
                            />
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Users section */}
        <section className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Пользователи системы
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Роли: администратор, аналитик
            </p>
          </div>
          <div className="grid gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="bg-white p-5 transition hover:bg-slate-50/50"
              >
                <p className="font-semibold text-slate-800">{u.full_name}</p>
                <p className="mt-0.5 text-sm text-slate-500">{u.email}</p>
                <span
                  className={`mt-2 inline-block rounded-lg px-2.5 py-1 text-xs font-medium ${
                    u.role === 'admin'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}
                >
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-12 text-center text-sm text-slate-400">
          API: /api/news · /api/companies · /api/stock-prices · /api/users · /api/sources
        </footer>
      </div>
    </div>
  );
}
