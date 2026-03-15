import mongoose, { type Document, type Model } from "mongoose";
import type { GroqAIResponse } from "@/types";

export interface IBurnoutLog extends Document {
  userId: string;
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
  ai?: GroqAIResponse;
  createdAt: Date;
  expiresAt: Date;
}

const BurnoutLogSchema = new mongoose.Schema<IBurnoutLog>({
  userId: { type: String, default: "anon", index: true },
  sleepHours: { type: Number, required: true },
  studyHours: { type: Number, required: true },
  stressLevel: { type: Number, required: true },
  tasksPending: { type: Number, required: true },
  deadlinesSoon: { type: Number, required: true },
  burnoutScore: { type: Number, required: true },
  risk: { type: String, required: true },
  flags: { type: [String], default: [] },
  crashProbability: { type: Number, required: true },
  focusMode: { type: Number, required: true },
  ai: {
    shortDiagnosis: { type: String },
    recoveryPlan: { type: [String], default: undefined },
    studyRestructuring: { type: String },
    oneMotivationalLine: { type: String },
    recommendedPomodoroMinutes: { type: Number },
    tags: { type: [String], default: undefined },
    raw: { type: String },
  },
  createdAt: { type: Date, default: Date.now, index: true },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    index: { expires: 0 },
  },
});

// Compound index for per-user time-series queries
BurnoutLogSchema.index({ userId: 1, createdAt: -1 });

const BurnoutLog: Model<IBurnoutLog> =
  (mongoose.models.BurnoutLog as Model<IBurnoutLog>) ||
  mongoose.model<IBurnoutLog>("BurnoutLog", BurnoutLogSchema);

export default BurnoutLog;
