"use client";

import { useState } from "react";
import type { GroqAIResponse, BurnoutResult } from "@/types";
import type { GroqCallInput } from "@/lib/groqClient";
import { RefreshCw, BrainCircuit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatbotPanelProps {
  ai: GroqAIResponse;
  context: BurnoutResult & {
    sleepHours:    number;
    studyHours:    number;
    stressLevel:   number;
    deadlinesSoon: number;
    tasksPending:  number;
  };
}

export default function ChatbotPanel({ ai: initialAI, context }: ChatbotPanelProps) {
  const [ai, setAI]                   = useState<GroqAIResponse>(initialAI);
  const [regenerating, setRegenerating] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const payload: GroqCallInput = { ...context };
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Regen failed");
      const { ai: newAI } = await res.json();
      setAI(newAI);
      setCheckedSteps(new Set());
    } catch {
      /* silent — keep previous result */
    } finally {
      setRegenerating(false);
    }
  };

  const recoveryPlan = Array.isArray(ai.recoveryPlan)
    ? ai.recoveryPlan
    : typeof ai.recoveryPlan === "string"
      ? [ai.recoveryPlan]
      : [];

  const tags = Array.isArray(ai.tags) ? ai.tags : [];

  return (
    <div
      className="w-full h-full rounded-2xl p-6"
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.09)",
      }}
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{
              background: "linear-gradient(135deg, rgba(6,214,208,0.2), rgba(167,139,250,0.2))",
              border: "1px solid rgba(167,139,250,0.2)",
            }}
          >
            <BrainCircuit size={16} className="text-violet-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">AI Recovery Plan</h2>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <RefreshCw size={12} className={regenerating ? "animate-spin" : ""} />
          {regenerating ? "Regenerating…" : "Regenerate"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={ai.shortDiagnosis ?? "content"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Diagnosis */}
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: "linear-gradient(135deg, rgba(6,214,208,0.08), rgba(129,140,248,0.08))",
              border: "1px solid rgba(6,214,208,0.15)",
            }}
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Diagnosis
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              {ai.shortDiagnosis || "No diagnosis available."}
            </p>
          </div>

          {/* Recovery Plan checklist */}
          {recoveryPlan.length > 0 && (
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Next 24h Plan
              </p>
              <ul className="space-y-2">
                {recoveryPlan.map((step, i) => (
                  <li
                    key={i}
                    onClick={() => toggleStep(i)}
                    className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition-all"
                    style={{
                      background: checkedSteps.has(i)
                        ? "rgba(16,185,129,0.08)"
                        : "rgba(255,255,255,0.04)",
                      border: checkedSteps.has(i)
                        ? "1px solid rgba(16,185,129,0.2)"
                        : "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {/* Checkbox circle */}
                    <span
                      className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all"
                      style={{
                        borderColor: checkedSteps.has(i) ? "#10b981" : "rgba(255,255,255,0.2)",
                        background:  checkedSteps.has(i) ? "#10b981" : "transparent",
                      }}
                    >
                      {checkedSteps.has(i) && (
                        <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="currentColor">
                          <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span
                      className={`leading-relaxed transition-all ${
                        checkedSteps.has(i) ? "line-through text-slate-500" : "text-slate-300"
                      }`}
                    >
                      {step}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Study Restructuring */}
          {ai.studyRestructuring && (
            <div
              className="rounded-xl px-4 py-3"
              style={{
                background: "rgba(167,139,250,0.07)",
                border: "1px solid rgba(167,139,250,0.15)",
              }}
            >
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-violet-400">
                Study Restructuring
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {ai.studyRestructuring}
              </p>
            </div>
          )}

          {/* Motivational line */}
          {ai.oneMotivationalLine && (
            <div
              className="rounded-xl px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderLeft: "3px solid rgba(6,214,208,0.5)",
              }}
            >
              <p className="text-sm italic text-slate-400 leading-relaxed">
                &ldquo;{ai.oneMotivationalLine}&rdquo;
              </p>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-0.5 text-xs"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "#64748b",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
