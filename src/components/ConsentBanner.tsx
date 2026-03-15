"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

type ConsentChoice = "accepted" | "declined" | null;

const STORAGE_KEY = "crashko_analytics_consent";

export default function ConsentBanner() {
  const [choice, setChoice] = useState<ConsentChoice>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "accepted" || saved === "declined") {
      setChoice(saved);
    }
    setHydrated(true);
  }, []);

  const shouldTrack = useMemo(
    () => hydrated && choice === "accepted",
    [choice, hydrated],
  );

  const save = (value: Exclude<ConsentChoice, null>) => {
    localStorage.setItem(STORAGE_KEY, value);
    setChoice(value);
  };

  return (
    <>
      {hydrated && choice === null && (
        <div
          className="fixed bottom-4 left-4 right-4 z-70 mx-auto w-full max-w-3xl rounded-2xl px-4 py-3"
          style={{
            background: "rgba(10, 14, 24, 0.92)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <p className="text-sm leading-relaxed text-slate-300">
            We use privacy-friendly analytics to improve performance and
            reliability. You can accept or decline tracking. See our{" "}
            <Link
              href="/legal"
              className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => save("declined")}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => save("accepted")}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
              style={{
                background:
                  "linear-gradient(135deg, #06d6d0 0%, #818cf8 55%, #f472b6 100%)",
              }}
            >
              Accept Analytics
            </button>
          </div>
        </div>
      )}

      {shouldTrack && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </>
  );
}
