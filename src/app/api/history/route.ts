import { NextResponse } from "next/server";
import { connectToMongo } from "@/lib/mongodb";
import BurnoutLog from "@/models/BurnoutLog";

/**
 * GET /api/history?userId=anon&page=1&limit=20
 * Returns paginated burnout logs newest-first.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") ?? "anon";
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Number(searchParams.get("limit") ?? "20"));
    const skip = (page - 1) * limit;

    const db = await connectToMongo();
    if (!db) return NextResponse.json({ logs: [], total: 0, page, pages: 0 });

    const [logs, total] = await Promise.all([
      BurnoutLog.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select(
          "createdAt sleepHours studyHours stressLevel tasksPending deadlinesSoon burnoutScore risk flags crashProbability focusMode",
        )
        .lean(),
      BurnoutLog.countDocuments({ userId }),
    ]);

    return NextResponse.json({
      logs: logs.map((l) => ({
        ...l,
        _id: String(l._id),
        createdAt: (l.createdAt as Date).toISOString(),
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[history] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
