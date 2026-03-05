"use client";

import { useEffect, useState } from "react";
import type { BurnoutResult } from "@/types";

interface ScoreCardProps {
  result: BurnoutResult;
}

const riskConfig = {
  Safe: {
    glowClass:   "glow-emerald",
    borderColor: "rgba(16,185,129,0.3)",
    bgAccent:    "rgba(16,185,129,0.07)",
    scoreGrad:   "linear-gradient(135deg, #34d399, #10b981)",
    badgeBg:     "rgba(16,185,129,0.15)",
    badgeColor:  "#34d399",
    badgeBorder: "rgba(16,185,129,0.3)",
    barColor:    "#10b981",
  },
  "At Risk": {
    glowClass:   "glow-amber",
    borderColor: "rgba(251,191,36,0.3)",
    bgAccent:    "rgba(251,191,36,0.07)",
    scoreGrad:   "linear-gradient(135deg, #fcd34d, #f59e0b)",
    badgeBg:     "rgba(251,191,36,0.15)",
    badgeColor:  "#fcd34d",
    badgeBorder: "rgba(251,191,36,0.3)",
    barColor:    "#f59e0b",
  },
  "High Risk": {
    glowClass:   "glow-red",
    borderColor: "rgba(239,68,68,0.35)",
    bgAccent:    "rgba(239,68,68,0.08)",
    scoreGrad:   "linear-gradient(135deg, #f87171, #ef4444)",
    badgeBg:     "rgba(239,68,68,0.15)",
    badgeColor:  "#f87171",
    badgeBorder: "rgba(239,68,68,0.35)",
    barColor:    "#ef4444",
  },
};

export default function ScoreCard({ result }: ScoreCardProps) {
  const cfg = riskConfig[result.risk];
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(result.crashProbability), 80);
    return () => clearTimeout(t);
  }, [result.crashProbability]);

  return (
    <div
      className={`w-full rounded-2xl p-6 ${cfg.glowClass}`}
      style={{
        background: `linear-gradient(145deg, rgba(255,255,255,0.05) 0%, ${cfg.bgAccent} 100%)`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${cfg.borderColor}`,
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Burnout Score
          </p>
          <div
            className="text-7xl font-extrabold leading-none"
            style={{
              background: cfg.scoreGrad,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {result.score}
          </div>
          <div className="mt-1 text-xs text-slate-500">out of 100</div>
        </div>

        <span
          className="mt-1 rounded-full px-3.5 py-1.5 text-sm font-semibold"
          style={{
            background:  cfg.badgeBg,
            color:       cfg.badgeColor,
            border:      `1px solid ${cfg.badgeBorder}`,
          }}
        >
          {result.risk}
        </span>
      </div>

      {/* Crash Probability bar */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>Crash Probability</span>
          <span className="font-semibold" style={{ color: cfg.badgeColor }}>
            {result.crashProbability}%
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{
              width:      `${barWidth}%`,
              background: cfg.barColor,
              boxShadow:  `0 0 10px ${cfg.barColor}80`,
            }}
          />
        </div>
      </div>

      {/* Focus recommendation */}
      <div
        className="mb-4 rounded-xl px-4 py-2.5 text-sm text-slate-300"
        style={{
          background: "rgba(255,255,255,0.04)",
          border:     "1px solid rgba(255,255,255,0.08)",
        }}
      >
        Recommended focus block:{" "}
        <strong className="text-white">{result.focusMode} min</strong> Pomodoro
      </div>

      {/* Flags */}
      {result.flags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {result.flags.map((f) => (
            <span
              key={f}
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background:  "rgba(255,255,255,0.06)",
                color:       "#94a3b8",
                border:      "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {f}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
