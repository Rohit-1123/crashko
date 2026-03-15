import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToMongo } from "@/lib/mongodb";
import BurnoutLog from "@/models/BurnoutLog";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectToMongo();
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const { id } = await params;
    const log = await BurnoutLog.findOne({ _id: id, userId: session.user.id })
      .select(
        "createdAt sleepHours studyHours stressLevel tasksPending deadlinesSoon burnoutScore risk flags crashProbability focusMode ai",
      )
      .lean();

    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    return NextResponse.json({
      log: {
        ...log,
        _id: String(log._id),
        createdAt: (log.createdAt as Date).toISOString(),
      },
    });
  } catch (err) {
    console.error("[history/id] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}