"use client";

import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface CrashAlertBannerProps {
  crashProbability: number;
  flags: string[];
}

const IMMEDIATE_STEPS = [
  "Hydrate now",
  "Sleep 7–8h tonight",
  "30-min screen break",
  "Short walk",
];

export default function CrashAlertBanner({
  crashProbability,
  flags,
}: CrashAlertBannerProps) {
  if (crashProbability < 65) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full rounded-2xl p-5 glow-red"
      style={{
        background:           "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.06))",
        backdropFilter:       "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border:               "1px solid rgba(239,68,68,0.3)",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "rgba(239,68,68,0.15)",
            border:     "1px solid rgba(239,68,68,0.3)",
          }}
        >
          <AlertTriangle size={18} className="text-red-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-red-300 text-base">
            High Crash Risk — {crashProbability}% probability
          </p>
          <p className="mt-1 text-sm text-red-400/80 leading-relaxed">
            Your patterns indicate an imminent burnout crash. Immediate action recommended.
          </p>

          {/* Flags */}
          {flags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {flags.map((f) => (
                <span
                  key={f}
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium text-red-300"
                  style={{
                    background: "rgba(239,68,68,0.12)",
                    border:     "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          )}

          {/* Immediate steps */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-red-400">
              Immediate steps
            </span>
            {IMMEDIATE_STEPS.map((step) => (
              <span
                key={step}
                className="rounded-lg px-2.5 py-1 text-xs text-red-300"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border:     "1px solid rgba(239,68,68,0.15)",
                }}
              >
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
