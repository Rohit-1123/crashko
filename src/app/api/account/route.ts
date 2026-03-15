import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToMongo } from "@/lib/mongodb";
import BurnoutLog from "@/models/BurnoutLog";
import User from "@/models/User";

/**
 * DELETE /api/account
 * Deletes authenticated user's profile record (by email when available)
 * and all associated burnout logs.
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectToMongo();
    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const [logsResult, userResult] = await Promise.all([
      BurnoutLog.deleteMany({ userId: session.user.id }),
      session.user.email
        ? User.deleteOne({ email: session.user.email.toLowerCase() })
        : Promise.resolve({ deletedCount: 0 }),
    ]);

    return NextResponse.json({
      deletedLogs: logsResult.deletedCount,
      deletedUser: userResult.deletedCount,
    });
  } catch (err) {
    console.error("[account/delete] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
