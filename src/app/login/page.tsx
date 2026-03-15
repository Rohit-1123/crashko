"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, ChartLine, ShieldCheck } from "lucide-react";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LoginContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [router, status]);

  if (status === "authenticated") return null;

  return (
    <div className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-6xl items-center gap-6 px-4 py-8 md:grid-cols-2 md:gap-8">
      <motion.section
        className="order-2 rounded-2xl p-5 md:order-1 md:p-6"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
        }}
      >
        <h2 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
          Track your burnout with context, not guesswork.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Crashko combines your daily check-in with trend-based scoring and
          consent-based AI recovery guidance.
        </p>

        <div className="mt-5 space-y-3">
          <div
            className="flex items-start gap-3 rounded-xl p-3"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <ChartLine size={16} className="mt-0.5 text-cyan-400" />
            <p className="text-xs leading-relaxed text-slate-300">
              Get an immediate risk score from your sleep, workload, stress, and
              deadlines.
            </p>
          </div>
          <div
            className="flex items-start gap-3 rounded-xl p-3"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <BrainCircuit size={16} className="mt-0.5 text-violet-400" />
            <p className="text-xs leading-relaxed text-slate-300">
              Generate AI recovery plans only when you explicitly consent for
              that check-in.
            </p>
          </div>
          <div
            className="flex items-start gap-3 rounded-xl p-3"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <ShieldCheck size={16} className="mt-0.5 text-emerald-400" />
            <p className="text-xs leading-relaxed text-slate-300">
              Control your data with analytics opt-in and in-app log/account
              deletion options.
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          By continuing, you agree to our{" "}
          <Link
            href="/legal"
            className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </motion.section>

      <motion.div
        className="order-1 w-full md:order-2"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mb-6 text-center">
          <h1
            className="mb-2 text-3xl font-extrabold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #06d6d0, #a78bfa, #f472b6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Welcome to Crashko
          </h1>
          <p className="text-sm text-slate-400">
            Sign in to continue to your dashboard.
          </p>
        </div>

        <div
          className="rounded-2xl p-6 md:p-8"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="flex w-full items-center justify-center gap-3 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="mt-4 text-center text-xs text-slate-500">
            New users are registered automatically on first sign-in.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
