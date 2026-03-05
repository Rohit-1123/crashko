"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";

interface FocusModeCardProps {
  minutes: number;
}

type TimerState = "idle" | "running" | "paused" | "done";

export default function FocusModeCard({ minutes }: FocusModeCardProps) {
  const [state, setState]             = useState<TimerState>("idle");
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    clearInterval(intervalRef.current!);
    setState("idle");
    setSecondsLeft(minutes * 60);
  }, [minutes]);

  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setState("done");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [state]);

  const total    = minutes * 60;
  const progress = total > 0 ? ((total - secondsLeft) / total) * 100 : 0;
  const mm       = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss       = String(secondsLeft % 60).padStart(2, "0");

  const circumference    = 2 * Math.PI * 40;
  const strokeDashoffset = circumference * (progress / 100);

  const handleToggle = () => {
    if (state === "done")          { setSecondsLeft(minutes * 60); setState("running"); }
    else if (state === "running")  { setState("paused"); }
    else                           { setState("running"); }
  };

  const handleReset = () => {
    clearInterval(intervalRef.current!);
    setState("idle");
    setSecondsLeft(minutes * 60);
  };

  const ringColor = state === "done" ? "#10b981" : state === "running" ? "#06d6d0" : "#a78bfa";

  return (
    <div
      className="w-full h-full rounded-2xl p-6"
      style={{
        background:           "rgba(255,255,255,0.04)",
        backdropFilter:       "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border:               "1px solid rgba(255,255,255,0.09)",
      }}
    >
      {/* Header */}
      <div className="mb-5 flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            background: "linear-gradient(135deg, rgba(167,139,250,0.2), rgba(6,214,208,0.2))",
            border:     "1px solid rgba(167,139,250,0.2)",
          }}
        >
          <Timer size={16} className="text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Focus Mode</h2>
          <p className="text-xs text-slate-500">{minutes}-minute Pomodoro session</p>
        </div>
      </div>

      {/* Circular Timer */}
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <svg className="-rotate-90" width="128" height="128" viewBox="0 0 100 100">
            {/* Track ring */}
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="7"
            />
            {/* Progress arc */}
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke={ringColor}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
              style={{
                filter: state === "running"
                  ? "drop-shadow(0 0 6px rgba(6,214,208,0.6))"
                  : state === "done"
                    ? "drop-shadow(0 0 6px rgba(16,185,129,0.6))"
                    : undefined,
              }}
            />
          </svg>

          {/* Time — solid white with a colour glow so it's always readable */}
          <div className="absolute text-center">
            <span
              className="text-2xl font-bold tabular-nums text-white"
              style={{ textShadow: `0 0 12px ${ringColor}` }}
            >
              {mm}:{ss}
            </span>
          </div>
        </div>

        {state === "done" && (
          <p className="text-sm font-medium text-emerald-400">
            Session complete — take a 5-min break.
          </p>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={handleToggle}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #06d6d0, #818cf8)",
            }}
          >
            {state === "running" ? (
              <><Pause size={14} />Pause</>
            ) : state === "done" ? (
              <><Play size={14} />Start Again</>
            ) : (
              <><Play size={14} />Start</>
            )}
          </button>

          {state !== "idle" && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition-all hover:text-white"
              style={{
                background: "rgba(255,255,255,0.05)",
                border:     "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <RotateCcw size={13} />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
