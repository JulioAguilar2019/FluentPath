"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ProgressChartsProps = {
  weeklyActivity: Array<{
    date: string;
    label: string;
    totalMinutes: number;
  }>;
  categoryBreakdown: Array<{
    name: string;
    minutes: number;
    color: string;
  }>;
  copy: {
    weeklyTitle: string;
    weeklyDescription: string;
    categoriesTitle: string;
    categoriesDescription: string;
    minutesLabel: string;
    empty: string;
  };
};

export function ProgressCharts({ weeklyActivity, categoryBreakdown, copy }: ProgressChartsProps) {
  const formatTooltipValue = (
    value: string | number | Array<string | number> | readonly (string | number)[] | undefined,
    label: string
  ) => {
    const rawValue = Array.isArray(value) ? value[0] : value;
    const normalizedValue = typeof rawValue === "number" ? rawValue : Number(rawValue ?? 0);
    return [`${normalizedValue} ${copy.minutesLabel}`, label] as const;
  };

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{copy.weeklyTitle}</h2>
          <p className="mt-2 text-sm text-slate-600">{copy.weeklyDescription}</p>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyActivity} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="#64748b" fontSize={12} />
              <YAxis tickLine={false} axisLine={false} stroke="#64748b" fontSize={12} />
              <Tooltip formatter={(value) => formatTooltipValue(value, copy.weeklyTitle)} />
              <Bar dataKey="totalMinutes" radius={[10, 10, 0, 0]} fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{copy.categoriesTitle}</h2>
          <p className="mt-2 text-sm text-slate-600">{copy.categoriesDescription}</p>
        </div>

        {categoryBreakdown.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip formatter={(value) => formatTooltipValue(value, copy.categoriesTitle)} />
                  <Pie data={categoryBreakdown} dataKey="minutes" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={4}>
                    {categoryBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              {categoryBreakdown.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm font-medium text-slate-700">{entry.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-950">{entry.minutes} {copy.minutesLabel}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 p-8 text-sm text-slate-600">
            {copy.empty}
          </div>
        )}
      </div>
    </section>
  );
}
