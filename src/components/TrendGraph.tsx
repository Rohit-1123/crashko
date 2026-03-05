"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { TrendDay } from "@/types";

interface TrendGraphProps {
  data: TrendDay[];
}

type Tab = "risk" | "recovery" | "stress";

const TABS: { id: Tab; label: string }[] = [
  { id: "risk",     label: "Risk"     },
  { id: "recovery", label: "Recovery" },
  { id: "stress",   label: "Stress"   },
];

const TAB_META: Record<
  Tab,
  { key: string; color: string; gradId: string; unit: string; domain: [number, number] }[]
> = {
  risk: [
    { key: "Burnout Score", color: "#f87171", gradId: "burnout", unit: "",   domain: [0, 100] },
    { key: "Crash %",       color: "#fb923c", gradId: "crash",   unit: "%",  domain: [0, 100] },
  ],
  recovery: [
    { key: "Sleep (h)",  color: "#06d6d0", gradId: "sleep", unit: "h", domain: [0, 12] },
    { key: "Study (h)",  color: "#a78bfa", gradId: "study", unit: "h", domain: [0, 12] },
  ],
  stress: [
    { key: "Stress", color: "#fbbf24", gradId: "stress", unit: "/10", domain: [0, 10] },
  ],
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface TooltipEntry {
  dataKey?: string | number;
  value?:   number | string;
  color?:   string;
}

function CustomTooltip({
  active, payload, label,
}: {
  active?:   boolean;
  payload?:  TooltipEntry[];
  label?:    string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3.5 py-2.5 shadow-2xl"
      style={{
        background:    "rgba(14,17,30,0.95)",
        border:        "1px solid rgba(255,255,255,0.1)",
        backdropFilter:"blur(16px)",
      }}
    >
      <p className="mb-2 text-xs font-semibold text-slate-400">{label}</p>
      {payload.map((p) => (
        <div key={String(p.dataKey)} className="flex items-center gap-2.5 text-sm">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.dataKey}</span>
          <span className="ml-auto pl-4 font-bold tabular-nums" style={{ color: p.color }}>
            {p.value !== undefined ? Math.round(Number(p.value)) : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TrendGraph({ data }: TrendGraphProps) {
  const [tab, setTab] = useState<Tab>("risk");

  if (!data || data.length === 0) {
    return (
      <div
        className="flex h-56 w-full items-center justify-center rounded-2xl text-sm text-slate-500"
        style={{
          background: "rgba(255,255,255,0.03)",
          border:     "1px dashed rgba(255,255,255,0.09)",
        }}
      >
        No trend data yet. Log a few more days to see your chart.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date:           formatDate(d.date),
    "Burnout Score": d.burnoutScore,
    "Crash %":       d.crashProbability ?? undefined,
    "Sleep (h)":     d.sleepHours,
    "Study (h)":     d.studyHours,
    Stress:          d.stressLevel,
  }));

  const series  = TAB_META[tab];
  const yDomain = series[0].domain;

  return (
    <div
      className="w-full rounded-2xl"
      style={{
        background:    "rgba(255,255,255,0.04)",
        backdropFilter:"blur(20px)",
        WebkitBackdropFilter:"blur(20px)",
        border:        "1px solid rgba(255,255,255,0.09)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-5 pb-3">
        <div>
          <h2 className="text-lg font-semibold text-white">7-Day Trends</h2>
          <p className="mt-0.5 text-xs text-slate-500">Your daily patterns over the last week</p>
        </div>

        {/* Tab pills */}
        <div
          className="flex gap-1 rounded-xl p-1"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
              style={
                tab === t.id
                  ? { background: "rgba(255,255,255,0.1)", color: "#fff" }
                  : { color: "#64748b" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 px-6 pb-3">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
            <span className="text-xs text-slate-500">
              {s.key}
              {s.unit && <span className="text-slate-600"> ({s.unit})</span>}
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="px-2 pb-5">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 6, right: 16, left: -8, bottom: 0 }}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.gradId} id={s.gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={s.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
            <YAxis domain={yDomain} tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2.5}
                fill={`url(#${s.gradId})`}
                dot={{ r: 3.5, fill: s.color, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: s.color, stroke: "rgba(255,255,255,0.3)", strokeWidth: 2 }}
                connectNulls
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
