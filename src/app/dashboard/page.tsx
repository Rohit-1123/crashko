"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useBurnoutForm } from "@/hooks/useBurnoutForm";
import { useTrends } from "@/hooks/useTrends";
import BurnoutForm from "@/components/BurnoutForm";
import TrendGraph from "@/components/TrendGraph";
import ShinyText from "@/components/ShinyText";
import { motion } from "framer-motion";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { loading, error, submitForm } = useBurnoutForm();
  const {
    data: trendData,
    loading: trendLoading,
    refetch: refetchTrends,
  } = useTrends(session?.user?.id ?? "", 7);

  const handleSubmit = async (data: Parameters<typeof submitForm>[0]) => {
    const analysis = await submitForm(data);
    setTimeout(() => refetchTrends(), 800);

    if (analysis?.logId) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          `crashko_result_${analysis.logId}`,
          JSON.stringify({
            _id: analysis.logId,
            createdAt: new Date().toISOString(),
            sleepHours: data.sleepHours,
            studyHours: data.studyHours,
            stressLevel: data.stressLevel,
            tasksPending: data.tasksPending,
            deadlinesSoon: data.deadlinesSoon,
            burnoutScore: analysis.result.score,
            risk: analysis.result.risk,
            flags: analysis.result.flags,
            crashProbability: analysis.result.crashProbability,
            focusMode: analysis.result.focusMode,
            ai: analysis.ai,
          }),
        );
      }

      router.push(`/dashboard/result/${analysis.logId}`);
    }
  };

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

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl px-4 py-3 text-sm text-red-300"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.1,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <BurnoutForm onSubmit={handleSubmit} loading={loading} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {trendLoading ? (
              <div
                className="flex h-full min-h-80 items-center justify-center rounded-2xl text-sm text-slate-500"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px dashed rgba(255,255,255,0.1)",
                }}
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin text-violet-400"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Loading trends…
                </span>
              </div>
            ) : (
              <TrendGraph data={trendData} />
            )}
          </motion.div>
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
