'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type WinRateData = {
  correct: number;
  incorrect: number;
  total: number;
  percentage: number;
};

const COLORS = { correct: '#10b981', incorrect: '#f43f5e' };

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
    return <Card className="h-24 animate-pulse" />;
  }

  if (!data || data.total === 0) {
    return (
      <Card className="flex items-center justify-center p-4 text-sm text-muted-foreground">
        Недостаточно данных
      </Card>
    );
  }

  const chartData = [
    { name: 'Верно', value: data.correct, color: COLORS.correct },
    { name: 'Неверно', value: data.incorrect, color: COLORS.incorrect },
  ];

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="h-16 w-16 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={16} outerRadius={26} paddingAngle={3} dataKey="value">
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [v ?? 0, '']}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-sm font-semibold text-muted-foreground">Винрейт</span>
            <span className="ml-auto text-2xl font-bold tracking-tight">{data.percentage}%</span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{data.correct} из {data.total} совпадений</p>
          <div className="mt-1.5 flex gap-3">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] text-muted-foreground">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
