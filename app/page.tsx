'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { NewsPriceChart } from './components/NewsPriceChart';
import { WinRateChart } from './components/WinRateChart';
import { AuthHeader } from './components/AuthHeader';
import { AdminPanel } from './components/AdminPanel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Newspaper, Building2, Users, TrendingUp, TrendingDown, Minus, Rss } from 'lucide-react';

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

const sectorColors: Record<string, string> = {
  'Финансы': 'bg-blue-50 text-blue-700',
  'Энергетика': 'bg-yellow-50 text-yellow-700',
  'Нефть и газ': 'bg-orange-50 text-orange-700',
  'IT': 'bg-purple-50 text-purple-700',
  'Металлургия': 'bg-zinc-100 text-zinc-700',
  'Ритейл': 'bg-green-50 text-green-700',
};

export default function Home() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === 'admin';

  const [news, setNews] = useState<NewsItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCompany, setFilterCompany] = useState<string>('all');

  useEffect(() => {
    Promise.all([
      fetch('/api/news').then((r) => r.json()),
      fetch('/api/companies').then((r) => r.json()),
      fetch('/api/users').then((r) => r.json()),
    ])
      .then(([n, c, u]) => { setNews(n); setCompanies(c); setUsers(u); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const url = filterCompany === 'all' ? '/api/news' : `/api/news?company_id=${filterCompany}`;
    fetch(url).then((r) => r.json()).then(setNews).catch(console.error);
  }, [filterCompany]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const SentimentBadge = ({ s }: { s: number | null }) => {
    if (s == null) return <Badge variant="secondary"><Minus className="h-3 w-3" /> Нейтрал</Badge>;
    if (s > 0.5) return <Badge variant="success"><TrendingUp className="h-3 w-3 mr-1" />Позитив</Badge>;
    if (s < -0.3) return <Badge variant="destructive"><TrendingDown className="h-3 w-3 mr-1" />Негатив</Badge>;
    return <Badge variant="secondary"><Minus className="h-3 w-3 mr-1" />Нейтрал</Badge>;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Rss className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">ФинАнализ</p>
              <p className="text-[10px] text-muted-foreground">Анализ финансовых новостей</p>
            </div>
          </div>
          <AuthHeader />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Hero stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Новостей', value: news.length, icon: Newspaper, color: 'text-blue-500' },
            { label: 'Компаний', value: companies.length, icon: Building2, color: 'text-purple-500' },
            { label: 'Пользователей', value: users.length, icon: Users, color: 'text-emerald-500' },
            { label: 'Источников', value: 5, icon: Rss, color: 'text-orange-500' },
          ].map((stat) => (
            <Card key={stat.label} className="overflow-hidden">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`rounded-xl bg-muted p-2.5`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left: News feed */}
          <div>
            {/* Filter bar */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Newspaper className="h-4 w-4" />
                Лента новостей
              </h2>
              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Фильтр:</span>
                <Select value={filterCompany} onValueChange={setFilterCompany}>
                  <SelectTrigger className="h-8 w-48 text-xs">
                    <SelectValue placeholder="Все компании" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все компании</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name} ({c.ticker})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* News cards */}
            <div className="space-y-4">
              {news.map((item) => {
                const ids = Array.isArray(item.company_ids)
                  ? item.company_ids
                  : (item.company_ids || '').toString().split(',').filter(Boolean).map(Number);

                return (
                  <Card key={item.id} className="overflow-hidden transition-shadow hover:shadow-md">
                    <CardContent className="p-0">
                      {/* News header */}
                      <div className="p-5 pb-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-semibold leading-snug text-foreground">
                              {item.title}
                            </h3>
                            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                              {item.content}
                            </p>
                          </div>
                          <div className="shrink-0">
                            <SentimentBadge s={item.sentiment} />
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            {item.source_name}
                          </span>
                          <span className="text-xs text-muted-foreground">{formatDate(item.published_at)}</span>
                          {item.companies && (
                            <span className="text-xs text-muted-foreground">
                              • {item.companies}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Charts */}
                      {ids.length > 0 && (
                        <>
                          <Separator />
                          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
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
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Companies */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-500" />
                  <CardTitle className="text-base">Компании</CardTitle>
                </div>
                <CardDescription>Отслеживаемые тикеры</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {companies.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 transition hover:bg-muted/50">
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.ticker}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${sectorColors[c.sector] ?? 'bg-muted text-muted-foreground'}`}>
                        {c.sector}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Users */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-500" />
                  <CardTitle className="text-base">Пользователи</CardTitle>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold uppercase text-muted-foreground">
                        {u.full_name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{u.full_name}</p>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <Badge variant={u.role === 'admin' ? 'warning' : 'success'} className="shrink-0 text-[10px]">
                        {u.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <WinRateChart />
          </div>
        </div>

        {/* Admin Panel */}
        {isAdmin && (
          <div className="mt-10">
            <AdminPanel
              users={users}
              news={news.map((n) => ({
                id: n.id,
                title: n.title,
                source_name: n.source_name,
                published_at: n.published_at,
                sentiment: n.sentiment,
              }))}
              currentUserId={(session?.user as { id?: string })?.id}
              onUsersChange={setUsers}
              onNewsChange={(updated) =>
                setNews((prev) =>
                  prev.filter((n) => updated.some((u) => u.id === n.id))
                )
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
