import { z } from "zod";

export const burnoutInputSchema = z.object({
  sleepHours: z
    .number({ error: "Sleep hours required" })
    .min(0, "Cannot be negative")
    .max(24, "Cannot exceed 24 hours"),

  studyHours: z
    .number({ error: "Study hours required" })
    .min(0, "Cannot be negative")
    .max(24, "Cannot exceed 24 hours"),

  stressLevel: z
    .number({ error: "Stress level required" })
    .min(1, "Minimum stress level is 1")
    .max(10, "Maximum stress level is 10"),

  tasksPending: z
    .number({ error: "Pending tasks required" })
    .min(0, "Cannot be negative")
    .max(100, "Too many tasks"),

  deadlinesSoon: z
    .number({ error: "Deadlines within 48h required" })
    .min(0, "Cannot be negative")
    .max(20, "Too many deadlines"),
  // userId is intentionally excluded — always read from the authenticated session server-side
});

export const groqCallInputSchema = z.object({
  score: z.number().min(0).max(100),
  risk: z.enum(["Safe", "At Risk", "High Risk"]),
  flags: z.array(z.string()),
  crashProbability: z.number().min(0).max(100),
  focusMode: z.number().min(15).max(90),
  sleepHours: z.number().min(0).max(24),
  studyHours: z.number().min(0).max(24),
  stressLevel: z.number().min(1).max(10),
  deadlinesSoon: z.number().min(0).max(20),
  tasksPending: z.number().min(0).max(100),
});


export type BurnoutInputSchema = z.infer<typeof burnoutInputSchema>;
export type GroqCallInputSchema = z.infer<typeof groqCallInputSchema>;
