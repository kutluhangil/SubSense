import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

/** Recharts-based analytics charts, theme-aware and consistent with the app. */

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

const TooltipBox: React.FC<{ label?: string; value: string; swatch?: string }> = ({ label, value, swatch }) => (
  <div className="rounded-xl border border-gray-100 bg-white/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-gray-800/95">
    {label && <p className="mb-0.5 flex items-center gap-1.5 font-semibold text-gray-500 dark:text-gray-400">
      {swatch && <span className="h-2 w-2 rounded-full" style={{ background: swatch }} />}{label}
    </p>}
    <p className="font-display font-bold text-gray-900 dark:text-white tabular-nums">{value}</p>
  </div>
);

export const TrendArea = ({ data, color = '#6366f1' }: { data: { label: string; value: number }[]; color?: string }) => {
  const { formatPrice } = useLanguage();
  const chartData = data.map((d) => ({ label: d.label, value: Math.round(d.value) }));

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={6} />
          <YAxis tickLine={false} axisLine={false} width={42} tick={{ fontSize: 10, fill: '#9ca3af' }} />
          <Tooltip
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }}
            content={({ active, payload, label }) =>
              active && payload && payload.length ? (
                <TooltipBox label={String(label)} value={formatPrice(Number(payload[0].value))} swatch={color} />
              ) : null
            }
          />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill="url(#trendFill)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--bg-card)' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export interface LineSeries {
  name: string;
  color: string;
  values: number[];
}

export const RegionLineChart = ({
  series,
  labels,
  symbol,
}: {
  series: LineSeries[];
  labels: string[];
  symbol: string;
}) => {
  const rows = labels.map((label, i) => {
    const row: Record<string, number | string> = { label };
    series.forEach((s) => {
      row[s.name] = Math.round((s.values[i] ?? 0) * 100) / 100;
    });
    return row;
  });

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={6} />
          <YAxis tickLine={false} axisLine={false} width={48} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => `${symbol}${v}`} />
          <Tooltip
            content={({ active, payload, label }) =>
              active && payload && payload.length ? (
                <div className="rounded-xl border border-gray-100 bg-white/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm dark:border-white/10 dark:bg-gray-800/95">
                  <p className="mb-1.5 font-semibold uppercase tracking-wider text-gray-400">{String(label)}</p>
                  {[...payload]
                    .sort((a, b) => Number(b.value) - Number(a.value))
                    .map((p) => (
                      <div key={String(p.dataKey)} className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                          {String(p.dataKey)}
                        </span>
                        <span className="font-bold tabular-nums text-gray-900 dark:text-white">{symbol}{Number(p.value).toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              ) : null
            }
          />
          {series.map((s) => (
            <Line key={s.name} type="monotone" dataKey={s.name} stroke={s.color} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CostDonut = ({ categoryTotals }: { categoryTotals: Record<string, number> }) => {
  const { t, formatPrice } = useLanguage();
  const data = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const total = data.reduce((a, b) => a + b.value, 0);

  if (total === 0) {
    return <div className="flex h-[180px] items-center justify-center text-xs text-gray-400">{t('analytics.no_spending')}</div>;
  }

  return (
    <div>
      <div className="relative h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={80} paddingAngle={2} stroke="none">
              {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip
              content={({ active, payload }) =>
                active && payload && payload.length ? (
                  <TooltipBox label={String(payload[0].name)} value={formatPrice(Number(payload[0].value))} swatch={payload[0].payload?.fill} />
                ) : null
              }
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{t('analytics.total_spend')}</span>
          <span className="font-display text-lg font-extrabold text-gray-900 dark:text-white tabular-nums">{formatPrice(total)}</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
              {d.name}
            </span>
            <span className="flex items-center gap-2">
              <span className="font-bold tabular-nums text-gray-900 dark:text-white">{formatPrice(d.value)}</span>
              <span className="w-9 text-right text-gray-400">{Math.round((d.value / total) * 100)}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
