'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

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
    return <Card className="h-full min-h-[180px] animate-pulse" />;
  }

  if (!data || data.total === 0) {
    return (
      <Card className="flex h-full min-h-[180px] items-center justify-center p-6 text-center text-sm text-muted-foreground">
        Недостаточно данных
      </Card>
    );
  }

  const chartData = [
    { name: 'Верно', value: data.correct, color: COLORS.correct },
    { name: 'Неверно', value: data.incorrect, color: COLORS.incorrect },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <CardTitle className="text-base">Винрейт</CardTitle>
        </div>
        <CardDescription>
          Совпадение тональности с движением цены
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <div className="flex items-center gap-4">
          <div className="h-28 w-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={22} outerRadius={36} paddingAngle={3} dataKey="value">
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [v ?? 0, '']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-3xl font-bold tracking-tight">{data.percentage}%</span>
              <p className="text-xs text-muted-foreground">{data.correct} из {data.total}</p>
            </div>
            <div className="space-y-1.5">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
