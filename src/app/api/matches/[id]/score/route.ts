import { NextResponse } from "next/server";
import { z } from "zod";
import { submitMatchScore } from "@/lib/data/store";
import { getLiveMatchById } from "@/lib/data/user-game";
import { getCurrentUser } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { submitMatchScoreDb } from "@/lib/supabase/game";

const Body = z.object({ score: z.string().min(1) });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "not_logged_in" }, { status: 401 });
  }
  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  }

  const match = await getLiveMatchById(id);
  if (!match) {
    return NextResponse.json({ ok: false, error: "invalid" });
  }
  if (!match.finalScore) {
    return NextResponse.json({ ok: false, error: "not_final" });
  }

  const score = parsed.data.score.trim();
  const correct = match.finalScore.trim() === score;
  const awardedPoints = correct ? 1 : 0;

  if (isSupabaseConfigured()) {
    const result = await submitMatchScoreDb(id, score, correct, awardedPoints);
    if (!result) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error });
    }
    return NextResponse.json({
      ok: true,
      correct: result.correct,
      awardedPoints: result.awarded_points,
      finalScore: match.finalScore,
    });
  }

  const result = submitMatchScore(user.id, id, score);
  if (!result.ok) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result);
}
