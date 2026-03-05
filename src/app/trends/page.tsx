"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTrends } from "@/hooks/useTrends";
import TrendGraph from "@/components/TrendGraph";
import { motion } from "framer-motion";

const RANGES = [
  { label: "7 days",  value: 7  },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
];

const RISK_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  "High Risk":{ bg: "rgba(239,68,68,0.12)",   text: "#f87171", border: "rgba(239,68,68,0.3)"   },
  "At Risk":  { bg: "rgba(251,191,36,0.12)",  text: "#fbbf24", border: "rgba(251,191,36,0.3)"  },
  Safe:       { bg: "rgba(16,185,129,0.12)",  text: "#34d399", border: "rgba(16,185,129,0.3)"  },
};

function StatCard({
  label, value, suffix, sub, badge,
}: {
  label:   string;
  value:   number;
  suffix:  string;
  sub?:    string;
  badge?:  string;
}) {
  const rc = badge ? RISK_COLOR[badge] : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl px-5 py-4"
      style={{
        background:           "rgba(255,255,255,0.04)",
        backdropFilter:       "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border:               "1px solid rgba(255,255,255,0.09)",
      }}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums text-white">
        {value}
        <span className="text-sm font-medium text-slate-500">{suffix}</span>
      </p>
      {badge && rc && (
        <span
          className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{ background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}
        >
          {badge}
        </span>
      )}
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </motion.div>
  );
}

export default function TrendsPage() {
  const [days, setDays] = useState(7);
  const { data: session } = useSession();
  const { data, loading } = useTrends(session?.user?.id ?? "", days);

  const avg = (arr: number[]) =>
    arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0;

  const scores    = data.map((d) => d.burnoutScore);
  const sleeps    = data.map((d) => d.sleepHours);
  const stresses  = data.map((d) => d.stressLevel);
  const crashes   = data.map((d) => d.crashProbability ?? 0);

  const avgScore  = avg(scores);
  const avgSleep  = avg(sleeps);
  const avgStress = avg(stresses);
  const avgCrash  = avg(crashes);
  const riskLabel = avgScore > 60 ? "High Risk" : avgScore > 30 ? "At Risk" : "Safe";

  const bestDay  = data.reduce((best, d)  => (!best || d.burnoutScore < best.burnoutScore  ? d : best), data[0] ?? null);
  const worstDay = data.reduce((worst, d) => (!worst || d.burnoutScore > worst.burnoutScore ? d : worst), data[0] ?? null);
  const fmtDate  = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const emptyBox = (msg: string) => (
    <div
      className="flex h-48 items-center justify-center rounded-2xl text-sm text-slate-500"
      style={{
        background: "rgba(255,255,255,0.03)",
        border:     "1px dashed rgba(255,255,255,0.09)",
      }}
    >
      {msg}
    </div>
  );

  return (
    <div className="flex-1">
      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <motion.div
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div>
            <h1
              className="text-2xl font-extrabold tracking-tight"
              style={{
                background: "linear-gradient(135deg, #06d6d0, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
                backgroundClip: "text",
              }}
            >
              Trends
            </h1>
            <p className="mt-1 text-sm text-slate-500">Your burnout patterns over time.</p>
          </div>

          {/* Range pills */}
          <div
            className="flex gap-1 self-start rounded-xl p-1"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setDays(r.value)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                style={
                  days === r.value
                    ? { background: "rgba(255,255,255,0.1)", color: "#fff" }
                    : { color: "#64748b" }
                }
              >
                {r.label}
              </button>
            ))}
          </div>
        </motion.div>

        {loading
          ? emptyBox("Loading trends…")
          : data.length === 0
            ? emptyBox("No data yet — log a day from the Dashboard to get started.")
            : (
              <>
                {/* Stat cards */}
                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <StatCard label="Avg Burnout" value={avgScore}  suffix="/100" badge={riskLabel} />
                  <StatCard label="Avg Sleep"   value={avgSleep}  suffix="h"    sub={avgSleep < 6 ? "Low" : avgSleep >= 7 ? "Good" : "Okay"} />
                  <StatCard label="Avg Stress"  value={avgStress} suffix="/10"  />
                  <StatCard label="Avg Crash %"  value={avgCrash}  suffix="%"   />
                </div>

                {/* Best / worst */}
                {(bestDay || worstDay) && (
                  <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {bestDay && (
                      <div
                        className="flex items-center gap-4 rounded-2xl px-5 py-4"
                        style={{
                          background: "rgba(16,185,129,0.06)",
                          border:     "1px solid rgba(16,185,129,0.2)",
                        }}
                      >
                        <div>
                          <p className="text-xs font-medium text-emerald-400">Best day in range</p>
                          <p className="text-base font-bold text-white">{fmtDate(bestDay.date)}</p>
                          <p className="text-xs text-slate-500">
                            Score {bestDay.burnoutScore} · {bestDay.sleepHours}h sleep
                          </p>
                        </div>
                      </div>
                    )}
                    {worstDay && (
                      <div
                        className="flex items-center gap-4 rounded-2xl px-5 py-4"
                        style={{
                          background: "rgba(239,68,68,0.06)",
                          border:     "1px solid rgba(239,68,68,0.2)",
                        }}
                      >
                        <div>
                          <p className="text-xs font-medium text-red-400">Hardest day in range</p>
                          <p className="text-base font-bold text-white">{fmtDate(worstDay.date)}</p>
                          <p className="text-xs text-slate-500">
                            Score {worstDay.burnoutScore} · stress {worstDay.stressLevel}/10
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <TrendGraph data={data} />
              </>
            )}
      </main>
    </div>
  );
}
