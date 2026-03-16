'use client';

import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { BarChart2 } from 'lucide-react';

type PricePoint = { date: string; close: number; label: string; isNewsDay: boolean };

type Props = {
  companyId: number;
  companyName: string;
  ticker: string;
  newsPublishedAt: string;
};

export function NewsPriceChart({ companyId, companyName, ticker, newsPublishedAt }: Props) {
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const newsDate = new Date(newsPublishedAt);
    const from = new Date(newsDate); from.setDate(from.getDate() - 2);
    const to = new Date(newsDate); to.setDate(to.getDate() + 3);
    const fromStr = from.toISOString().split('T')[0];
    const toStr = to.toISOString().split('T')[0];

    fetch(`/api/stock-prices?company_id=${companyId}&from=${fromStr}&to=${toStr}`)
      .then((r) => r.json())
      .then((prices: Array<{ date: string; close: number }>) => {
        const newsDateStr = newsDate.toISOString().split('T')[0];
        setData(prices.map((p) => {
          const d = typeof p.date === 'string' ? p.date.split('T')[0] : p.date;
          return {
            date: d,
            close: p.close,
            label: new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
            isNewsDay: d === newsDateStr,
          };
        }));
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [companyId, newsPublishedAt]);

  if (loading) {
    return <div className="h-40 animate-pulse rounded-xl bg-muted" />;
  }

  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
        Нет данных котировок
      </div>
    );
  }

  const minPrice = Math.min(...data.map((d) => d.close));
  const maxPrice = Math.max(...data.map((d) => d.close));
  const pad = (maxPrice - minPrice) * 0.12 || 1;
  const newsDay = data.find((d) => d.isNewsDay)?.label;
  const first = data[0]?.close;
  const last = data[data.length - 1]?.close;
  const isUp = last > first;

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">{companyName}</span>
          <span className="text-[10px] text-muted-foreground">({ticker})</span>
        </div>
        <span className={`text-xs font-semibold ${isUp ? 'text-emerald-600' : 'text-rose-500'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(((last - first) / first) * 100).toFixed(2)}%
        </span>
      </div>
      <div className="p-3 pt-4">
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
              <YAxis domain={[minPrice - pad, maxPrice + pad]} tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} tickFormatter={(v) => v.toFixed(0)} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)' }}
                formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : '—', 'Цена']}
                labelFormatter={(l) => `Дата: ${l}`}
              />
              {newsDay && (
                <ReferenceLine x={newsDay} stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: 'новость', position: 'top', fontSize: 9, fill: '#f59e0b' }} />
              )}
              <Line
                type="monotone"
                dataKey="close"
                stroke={isUp ? '#10b981' : '#f43f5e'}
                strokeWidth={2}
                dot={{ r: 2.5, fill: isUp ? '#10b981' : '#f43f5e', strokeWidth: 0 }}
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Жёлтый пунктир — день выхода новости
        </p>
      </div>
    </div>
  );
}
