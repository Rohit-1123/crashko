import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { callGroq } from "@/lib/groqClient";
import type { GroqCallInput } from "@/lib/groqClient";
import { rateLimit } from "@/lib/rateLimit";
import { groqCallInputSchema } from "@/lib/validations";

/**
 * POST /api/chat
 * Regenerates an AI response for the same burnout context.
 * Body: same shape as GroqCallInput
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 15 regenerations per minute per user
    if (!(await rateLimit(`chat:${session.user.id}`, 15, 60_000))) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429 },
      );
    }

    const parsed = groqCallInputSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const body: GroqCallInput = parsed.data;

    const ai = await callGroq(body);
    return NextResponse.json({ ai });
  } catch (err) {
    console.error("[chat] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
