"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface LogEntry {
  _id: string;
  createdAt: string;
  sleepHours: number;
  studyHours: number;
  stressLevel: number;
  tasksPending: number;
  deadlinesSoon: number;
  burnoutScore: number;
  risk: string;
  flags: string[];
  crashProbability: number;
  focusMode: number;
}

const RISK_CONFIG: Record<
  string,
  { color: string; glow: string; bg: string; border: string }
> = {
  "High Risk": {
    color: "#f87171",
    glow: "rgba(239,68,68,0.5)",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.25)",
  },
  "At Risk": {
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.5)",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.25)",
  },
  Safe: {
    color: "#34d399",
    glow: "rgba(16,185,129,0.5)",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.25)",
  },
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-200">{value}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl px-3 py-2"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function HistoryPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchLogs = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/history?page=${p}&limit=10`);
        const json = await res.json();
        setLogs(json.logs ?? []);
        setTotal(json.total ?? 0);
        setPages(json.pages ?? 1);
        setPage(p);
      } catch {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    if (userId) fetchLogs(1);
  }, [fetchLogs, userId]);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const emptyBox = (msg: string) => (
    <div
      className="flex h-48 items-center justify-center rounded-2xl text-sm text-slate-500"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px dashed rgba(255,255,255,0.09)",
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
          className="mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #06d6d0, #a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            History
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {total > 0
              ? `${total} burnout log${total !== 1 ? "s" : ""} saved`
              : "No logs yet"}
          </p>
        </motion.div>

        {loading ? (
          emptyBox("Loading history…")
        ) : logs.length === 0 ? (
          emptyBox("No logs yet — log a day from the Dashboard first.")
        ) : (
          <div className="flex flex-col gap-3">
            {logs.map((log, idx) => {
              const isOpen = expanded === log._id;
              const rc = RISK_CONFIG[log.risk] ?? RISK_CONFIG.Safe;
              const circumference = 2 * Math.PI * 14;
              const arcLen = (log.burnoutScore / 100) * circumference;

              return (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  className="overflow-hidden rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {/* Row header */}
                  <button
                    type="button"
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-white/3"
                    onClick={() => setExpanded(isOpen ? null : log._id)}
                  >
                    {/* Circular score */}
                    <div className="relative h-10 w-10 shrink-0">
                      <svg viewBox="0 0 36 36" className="-rotate-90">
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="rgba(255,255,255,0.06)"
                          strokeWidth="3.5"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke={rc.color}
                          strokeWidth="3.5"
                          strokeDasharray={`${arcLen} ${circumference}`}
                          strokeLinecap="round"
                          style={{ filter: `drop-shadow(0 0 3px ${rc.glow})` }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                        {log.burnoutScore}
                      </span>
                    </div>

                    {/* Date + badges */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">
                        {fmtDate(log.createdAt)}
                      </p>
                      <div className="mt-0.5 flex flex-wrap gap-1.5">
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{
                            background: rc.bg,
                            color: rc.color,
                            border: `1px solid ${rc.border}`,
                          }}
                        >
                          {log.risk}
                        </span>
                        {log.flags.slice(0, 2).map((f) => (
                          <span
                            key={f}
                            className="rounded-full px-2 py-0.5 text-xs"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              color: "#64748b",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            {f}
                          </span>
                        ))}
                        {log.flags.length > 2 && (
                          <span
                            className="rounded-full px-2 py-0.5 text-xs"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              color: "#64748b",
                            }}
                          >
                            +{log.flags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick metrics */}
                    <div className="hidden shrink-0 gap-5 sm:flex">
                      <Metric label="Sleep" value={`${log.sleepHours}h`} />
                      <Metric label="Stress" value={`${log.stressLevel}/10`} />
                      <Metric
                        label="Crash"
                        value={`${log.crashProbability}%`}
                      />
                    </div>

                    <ChevronDown
                      size={16}
                      className={`ml-2 shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div
                          className="px-5 py-4"
                          style={{
                            borderTop: "1px solid rgba(255,255,255,0.07)",
                          }}
                        >
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <DetailItem
                              label="Sleep"
                              value={`${log.sleepHours} hrs`}
                            />
                            <DetailItem
                              label="Study"
                              value={`${log.studyHours} hrs`}
                            />
                            <DetailItem
                              label="Stress"
                              value={`${log.stressLevel} / 10`}
                            />
                            <DetailItem
                              label="Tasks"
                              value={String(log.tasksPending)}
                            />
                            <DetailItem
                              label="Deadlines"
                              value={String(log.deadlinesSoon)}
                            />
                            <DetailItem
                              label="Crash %"
                              value={`${log.crashProbability}%`}
                            />
                            <DetailItem
                              label="Focus Block"
                              value={`${log.focusMode} min`}
                            />
                            <DetailItem
                              label="Burnout Score"
                              value={`${log.burnoutScore} / 100`}
                            />
                          </div>

                          {/* Progress bar */}
                          <div className="mt-4">
                            <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
                              <span>Burnout</span>
                              <span>{log.burnoutScore}/100</span>
                            </div>
                            <div
                              className="h-1.5 w-full overflow-hidden rounded-full"
                              style={{ background: "rgba(255,255,255,0.07)" }}
                            >
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${log.burnoutScore}%`,
                                  background: rc.color,
                                  boxShadow: `0 0 8px ${rc.glow}`,
                                }}
                              />
                            </div>
                          </div>

                          {log.flags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {log.flags.map((f) => (
                                <span
                                  key={f}
                                  className="rounded-full px-2.5 py-1 text-xs"
                                  style={{
                                    background: "rgba(255,255,255,0.05)",
                                    color: "#64748b",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                  }}
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Pagination */}
            {pages > 1 && (
              <div className="mt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => fetchLogs(page - 1)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 transition-all hover:text-white disabled:opacity-40"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  Prev
                </button>
                <span className="text-sm text-slate-500">
                  {page} / {pages}
                </span>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => fetchLogs(page + 1)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 transition-all hover:text-white disabled:opacity-40"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
