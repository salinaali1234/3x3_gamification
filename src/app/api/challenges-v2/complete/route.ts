import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { completeChallenge } from "@/lib/data/challenges-v2";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { completeChallengeDb } from "@/lib/supabase/challenges-v2";

const Body = z.object({
  challengeId: z.string().min(1),
  code: z.string().optional(),
  letters: z.array(z.string()).optional(),
  photo: z.boolean().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "not_logged_in" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  }

  const submission = {
    code: parsed.data.code,
    letters: parsed.data.letters,
  };
  const submittedCode =
    parsed.data.letters?.map((l) => l.trim()).join("") ?? parsed.data.code;

  if (isSupabaseConfigured()) {
    const db = await completeChallengeDb(parsed.data.challengeId, submittedCode);
    if (db.ok) {
      completeChallenge(user.id, parsed.data.challengeId, submission);
      revalidatePath("/leaderboard");
      revalidatePath("/");
      return NextResponse.json({ ok: true, pointsAwarded: db.pointsAwarded });
    }
    if (db.error === "already_completed") {
      completeChallenge(user.id, parsed.data.challengeId, submission);
      revalidatePath("/leaderboard");
      return NextResponse.json({ ok: true, pointsAwarded: 0 });
    }
    return NextResponse.json({ ok: false, error: db.error }, { status: 400 });
  }

  const result = completeChallenge(user.id, parsed.data.challengeId, submission);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  revalidatePath("/leaderboard");
  revalidatePath("/");
  return NextResponse.json({ ok: true, pointsAwarded: result.pointsAwarded });
}
