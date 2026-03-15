"use client";

import ChatbotPanel from "@/components/ChatbotPanel";
import CrashAlertBanner from "@/components/CrashAlertBanner";
import FocusModeCard from "@/components/FocusModeCard";
import ScoreCard from "@/components/ScoreCard";
import ShinyText from "@/components/ShinyText";
import TrendGraph from "@/components/TrendGraph";
import { useTrends } from "@/hooks/useTrends";
import type { BurnoutResult, GroqAIResponse } from "@/types";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface ResultLog {
  _id: string;
  createdAt: string;
  sleepHours: number;
  studyHours: number;
  stressLevel: number;
  tasksPending: number;
  deadlinesSoon: number;
  burnoutScore: number;
  risk: BurnoutResult["risk"];
  flags: string[];
  crashProbability: number;
  focusMode: number;
  ai?: GroqAIResponse;
}

export default function ResultPage() {
  const params = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [log, setLog] = useState<ResultLog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingAi, setGeneratingAi] = useState(false);
  const { data: trendData, loading: trendLoading } = useTrends(
    session?.user?.id ?? "",
    7,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const snapshot = sessionStorage.getItem(`crashko_result_${params.id}`);
    if (!snapshot) {
      return;
    }

    try {
      setLog(JSON.parse(snapshot) as ResultLog);
    } catch {
      sessionStorage.removeItem(`crashko_result_${params.id}`);
    }
  }, [params.id]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/history/${params.id}`);
        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(json.error ?? "Failed to load analysis");
        }

        if (!cancelled) {
          setLog((prev) => {
            const next = json.log as ResultLog;
            if (!next.ai && prev?.ai) {
              return { ...next, ai: prev.ai };
            }
            return next;
          });
          if (typeof window !== "undefined") {
            sessionStorage.removeItem(`crashko_result_${params.id}`);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load analysis",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  useEffect(() => {
    if (!log || log.ai || generatingAi) {
      return;
    }

    let cancelled = false;

    const generateMissingAi = async () => {
      setGeneratingAi(true);
      try {
        const payload = {
          score: log.burnoutScore,
          risk: log.risk,
          flags: log.flags,
          crashProbability: log.crashProbability,
          focusMode: log.focusMode,
          sleepHours: log.sleepHours,
          studyHours: log.studyHours,
          stressLevel: log.stressLevel,
          deadlinesSoon: log.deadlinesSoon,
          tasksPending: log.tasksPending,
        };

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.ai) {
          return;
        }

        if (!cancelled) {
          setLog((prev) =>
            prev ? { ...prev, ai: json.ai as GroqAIResponse } : prev,
          );
        }
      } catch {
        // Keep fallback card if regeneration fails.
      } finally {
        if (!cancelled) {
          setGeneratingAi(false);
        }
      }
    };

    generateMissingAi();

    return () => {
      cancelled = true;
    };
  }, [generatingAi, log]);

  const result = log
    ? {
        score: log.burnoutScore,
        risk: log.risk,
        flags: log.flags,
        crashProbability: log.crashProbability,
        focusMode: log.focusMode,
      }
    : null;

  if (loading) {
    return (
      <div className="flex-1">
        <main className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex flex-col gap-6">
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
            >
              <div className="h-6 w-32 animate-pulse rounded bg-white/5" />
              <div className="mt-4 h-20 animate-pulse rounded-xl bg-white/5" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="h-72 animate-pulse rounded-2xl bg-white/5" />
              <div className="h-72 animate-pulse rounded-2xl bg-white/5" />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-96 animate-pulse rounded-2xl bg-white/5" />
              <div className="h-48 animate-pulse rounded-2xl bg-white/5" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!log || !result) {
    return (
      <div className="flex-1">
        <main className="mx-auto max-w-4xl px-4 py-10">
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p className="text-base font-semibold text-white">
              Could not load this analysis.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {error ?? "This result is unavailable."}
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
              style={{
                background:
                  "linear-gradient(135deg, #06d6d0 0%, #818cf8 50%, #f472b6 100%)",
              }}
            >
              <ArrowLeft size={14} />
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <ShinyText
            as="h1"
            className="mb-3 text-4xl font-extrabold tracking-tight sm:text-5xl"
          >
            Know before you crash.
          </ShinyText>
          <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">
            Log your day and receive your burnout score plus an AI-generated
            recovery plan — in seconds.
          </p>
        </motion.div>

        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:text-white"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <ArrowLeft size={14} />
              New Check-in
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CrashAlertBanner
              crashProbability={result.crashProbability}
              flags={result.flags}
            />
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
            >
              <ScoreCard result={result} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12 }}
            >
              <FocusModeCard minutes={result.focusMode} />
            </motion.div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {log.ai ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.18 }}
              >
                <ChatbotPanel
                  ai={log.ai}
                  context={{
                    ...result,
                    sleepHours: log.sleepHours,
                    studyHours: log.studyHours,
                    stressLevel: log.stressLevel,
                    deadlinesSoon: log.deadlinesSoon,
                    tasksPending: log.tasksPending,
                  }}
                />
              </motion.div>
            ) : generatingAi ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.18 }}
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              >
                <h2 className="text-lg font-semibold text-white">
                  AI Recovery Plan
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  Generating your AI diagnosis and recovery steps...
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.18 }}
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              >
                <h2 className="text-lg font-semibold text-white">
                  AI Recovery Plan
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  This saved result does not include AI analysis. New analyses
                  will show the full AI diagnosis and recovery plan here.
                </p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.24 }}
            >
              {trendLoading ? (
                <div
                  className="flex h-48 items-center justify-center rounded-2xl text-sm text-slate-500"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px dashed rgba(255,255,255,0.1)",
                  }}
                >
                  Loading trends…
                </div>
              ) : (
                <TrendGraph data={trendData} />
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <footer
        className="mt-16 py-10 text-center text-xs text-slate-600"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-sm font-semibold text-slate-500">Crashko</p>
        <p className="mt-1">AI-powered burnout prediction for students.</p>
        <div className="mt-4 flex items-center justify-center gap-5 text-slate-500">
          <Link href="/legal" className="hover:text-slate-300">
            Privacy Policy
          </Link>
          <Link href="/settings" className="hover:text-slate-300">
            Settings
          </Link>
        </div>
        <p className="mt-5">
          © {new Date().getFullYear()} Crashko. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
