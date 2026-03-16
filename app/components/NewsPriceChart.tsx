'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

type PricePoint = {
  date: string;
  close: number;
  label: string;
  isNewsDay: boolean;
};

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
    const fromDate = new Date(newsDate);
    fromDate.setDate(fromDate.getDate() - 2);
    const toDate = new Date(newsDate);
    toDate.setDate(toDate.getDate() + 3);

    const fromStr = fromDate.toISOString().split('T')[0];
    const toStr = toDate.toISOString().split('T')[0];

    fetch(`/api/stock-prices?company_id=${companyId}&from=${fromStr}&to=${toStr}`)
      .then((r) => r.json())
      .then((prices: Array<{ date: string; close: number }>) => {
        const newsDateStr = newsDate.toISOString().split('T')[0];
        const chartData = prices.map((p) => {
          const d = typeof p.date === 'string' ? p.date.split('T')[0] : p.date;
          return {
            date: d,
            close: p.close,
            label: new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
            isNewsDay: d === newsDateStr,
          };
        });
        setData(chartData);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [companyId, newsPublishedAt]);

  if (loading) {
    return (
      <div className="h-36 animate-pulse rounded-xl bg-slate-100" />
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 text-sm text-slate-500">
        Нет данных о котировках
      </div>
    );
  }

  const minPrice = Math.min(...data.map((d) => d.close));
  const maxPrice = Math.max(...data.map((d) => d.close));
  const padding = (maxPrice - minPrice) * 0.1 || 1;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {companyName} ({ticker})
      </p>
      <p className="mb-2 text-[10px] text-slate-400">
        Динамика цены 0–12 ч после новости
      </p>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10 }}
              stroke="#94a3b8"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[minPrice - padding, maxPrice + padding]}
              tick={{ fontSize: 10 }}
              stroke="#94a3b8"
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v.toFixed(0)}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : '—', 'Цена']}
              labelFormatter={(label) => `Дата: ${label}`}
            />
            <ReferenceLine
              x={data.find((d) => d.isNewsDay)?.label}
              stroke="#0d9488"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#0d9488"
              strokeWidth={2}
              dot={{ r: 3, fill: '#0d9488', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[10px] text-slate-400">
        Пунктир — день выхода новости
      </p>
    </div>
  );
}
