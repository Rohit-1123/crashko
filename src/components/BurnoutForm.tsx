"use client";

import { useState } from "react";
import type { BurnoutInput } from "@/types";
import Tooltip from "@/components/Tooltip";
import { Info } from "lucide-react";

interface BurnoutFormProps {
  onSubmit: (data: BurnoutInput) => void;
  loading: boolean;
}

const defaultValues: BurnoutInput = {
  sleepHours:    7,
  studyHours:    5,
  stressLevel:   5,
  tasksPending:  3,
  deadlinesSoon: 0,
};

type RawForm = Record<keyof BurnoutInput, string>;

const toRaw = (v: BurnoutInput): RawForm =>
  Object.fromEntries(
    Object.entries(v).map(([k, val]) => [k, String(val)]),
  ) as RawForm;

export default function BurnoutForm({ onSubmit, loading }: BurnoutFormProps) {
  const [form, setForm] = useState<BurnoutInput>(defaultValues);
  const [raw,  setRaw]  = useState<RawForm>(toRaw(defaultValues));
  const [errors, setErrors] = useState<Partial<Record<keyof BurnoutInput, string>>>({});

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (isNaN(form.sleepHours)    || form.sleepHours < 0    || form.sleepHours > 24)   e.sleepHours    = "Enter a value between 0–24";
    if (isNaN(form.studyHours)    || form.studyHours < 0    || form.studyHours > 24)   e.studyHours    = "Enter a value between 0–24";
    if (isNaN(form.stressLevel)   || form.stressLevel < 1   || form.stressLevel > 10)  e.stressLevel   = "Enter a value between 1–10";
    if (isNaN(form.tasksPending)  || form.tasksPending < 0)                             e.tasksPending  = "Cannot be negative";
    if (isNaN(form.deadlinesSoon) || form.deadlinesSoon < 0)                           e.deadlinesSoon = "Cannot be negative";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (key: keyof BurnoutInput, rawValue: string) => {
    setRaw((prev) => ({ ...prev, [key]: rawValue }));
    const n = parseFloat(rawValue);
    if (!isNaN(n)) setForm((prev) => ({ ...prev, [key]: n }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const fields: {
    key:     keyof BurnoutInput;
    label:   string;
    min:     number;
    max:     number;
    step:    number;
    unit:    string;
    helper:  string;
    tooltip: string;
  }[] = [
    {
      key:     "sleepHours",
      label:   "Sleep Hours",
      min: 0, max: 24, step: 0.5, unit: "hrs",
      helper:  "How many hours did you sleep last night?",
      tooltip: "Sleep is your primary burnout shield. Under 6 hours activates cortisol overload, degrading focus and emotional resilience. Consistently low sleep is the single strongest predictor of student burnout.",
    },
    {
      key:     "studyHours",
      label:   "Study Hours",
      min: 0, max: 24, step: 0.5, unit: "hrs",
      helper:  "Total hours spent studying today.",
      tooltip: "Sustained cognitive effort without recovery builds mental fatigue. More than 6–8 study hours per day without breaks steeply escalates burnout risk. Quality beats quantity — your brain consolidates learning during rest.",
    },
    {
      key:     "stressLevel",
      label:   "Stress Level",
      min: 1, max: 10, step: 1, unit: "/10",
      helper:  "Rate your current stress (1 = calm, 10 = overwhelmed).",
      tooltip: "Chronic high stress (7+) triggers prolonged cortisol release, reducing the hippocampus's capacity to form memories and regulate emotion. A score above 7 combined with low sleep is a crash accelerator.",
    },
    {
      key:     "tasksPending",
      label:   "Pending Tasks",
      min: 0, max: 100, step: 1, unit: "tasks",
      helper:  "How many unfinished tasks do you have?",
      tooltip: "An overloaded task queue creates constant low-grade anxiety — even when you're not actively working. Each unfinished task consumes background mental bandwidth, draining your cognitive reserve throughout the day.",
    },
    {
      key:     "deadlinesSoon",
      label:   "Deadlines within 48h",
      min: 0, max: 20, step: 1, unit: "due",
      helper:  "Assignments, exams, or submissions due within 48 hours.",
      tooltip: "Imminent deadlines trigger the threat-response system, releasing adrenaline that impairs clear thinking and sleep. Multiple concurrent deadlines stack this effect, making them the most acute burnout trigger in the engine.",
    },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl p-6"
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.09)",
      }}
    >
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-white">
          Today&apos;s Check-in
        </h2>
        <p className="mt-0.5 text-sm text-slate-400">
          Track honestly — the engine learns your patterns.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(({ key, label, min, max, step, unit, helper, tooltip }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor={key}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-200"
              >
                {label}
                <Tooltip content={tooltip} position="top">
                  <Info
                    size={13}
                    className="cursor-help text-slate-500 transition-colors hover:text-violet-400"
                  />
                </Tooltip>
              </label>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{
                  background: "rgba(6,214,208,0.12)",
                  color: "#06d6d0",
                  border: "1px solid rgba(6,214,208,0.2)",
                }}
              >
                {isNaN(form[key] as number) ? "—" : form[key]} {unit}
              </span>
            </div>

            <input
              id={key}
              type="number"
              min={min}
              max={max}
              step={step}
              value={raw[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className={`w-full rounded-xl px-3 py-2.5 text-sm text-slate-100 outline-none transition-all focus:ring-2 ${
                errors[key]
                  ? "focus:ring-red-400"
                  : "focus:ring-violet-500/50"
              }`}
              style={{
                background: errors[key]
                  ? "rgba(239,68,68,0.07)"
                  : "rgba(255,255,255,0.05)",
                border: errors[key]
                  ? "1px solid rgba(239,68,68,0.35)"
                  : "1px solid rgba(255,255,255,0.1)",
              }}
            />

            {errors[key] ? (
              <p className="text-xs text-red-400">{errors[key]}</p>
            ) : (
              <p className="text-xs text-slate-500">{helper}</p>
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: loading
            ? "rgba(167,139,250,0.3)"
            : "linear-gradient(135deg, #06d6d0 0%, #818cf8 50%, #f472b6 100%)",
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Analyzing…
          </span>
        ) : (
          "Analyze My Burnout"
        )}
      </button>
    </form>
  );
}
