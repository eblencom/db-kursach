'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type WinRateData = {
  correct: number;
  incorrect: number;
  total: number;
  percentage: number;
};

const COLORS = {
  correct: '#059669',
  incorrect: '#dc2626',
};

export function WinRateChart() {
  const [data, setData] = useState<WinRateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/win-rate')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-full min-h-[200px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
    );
  }

  if (!data || data.total === 0) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        Недостаточно данных для расчёта винрейта
      </div>
    );
  }

  const chartData = [
    { name: 'Верные предсказания', value: data.correct, color: COLORS.correct },
    { name: 'Неверные предсказания', value: data.incorrect, color: COLORS.incorrect },
  ];

  return (
    <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
        <h3 className="font-semibold text-slate-800">
          Винрейт предсказаний
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Позитив + рост или Негатив + падение = верно
        </p>
      </div>
      <div className="flex items-center gap-6 p-5">
        <div className="h-32 w-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={26}
                outerRadius={40}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [value ?? 0, '']}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-3xl font-bold text-slate-800">{data.percentage}%</div>
          <p className="mt-1 text-sm text-slate-500">
            {data.correct} из {data.total} совпадений
          </p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS.correct }}
              />
              <span className="text-sm text-slate-600">Верно: {data.correct}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS.incorrect }}
              />
              <span className="text-sm text-slate-600">Неверно: {data.incorrect}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
