"use client";

import { useState } from "react";
import type { AnalyzeInput, BurnoutInput, AnalyzeApiResponse } from "@/types";

interface UseBurnoutFormReturn {
  loading: boolean;
  error: string | null;
  response: AnalyzeApiResponse | null;
  submitted: boolean;
  submitForm: (data: AnalyzeInput) => Promise<AnalyzeApiResponse | null>;
  lastInput: BurnoutInput | null;
  reset: () => void;
}

export function useBurnoutForm(): UseBurnoutFormReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AnalyzeApiResponse | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [lastInput, setLastInput] = useState<BurnoutInput | null>(null);

  const submitForm = async (data: AnalyzeInput) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `Server error ${res.status}`);
      }

      const json: AnalyzeApiResponse = await res.json();
      setResponse(json);
      setLastInput({
        sleepHours: data.sleepHours,
        studyHours: data.studyHours,
        stressLevel: data.stressLevel,
        tasksPending: data.tasksPending,
        deadlinesSoon: data.deadlinesSoon,
      });
      setSubmitted(true);
      return json;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResponse(null);
    setSubmitted(false);
    setError(null);
    setLastInput(null);
  };

  return { loading, error, response, submitted, submitForm, lastInput, reset };
}
