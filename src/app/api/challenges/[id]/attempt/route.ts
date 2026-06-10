import { NextResponse } from "next/server";
import { z } from "zod";
import {
  addChallengeAttempt,
  addPollVote,
  getChallengeById,
} from "@/lib/data/store";
import { hasChallengeAttempt } from "@/lib/data/user-game";
import { evaluateBadges } from "@/lib/award-points";
import { getCurrentUser } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { submitChallengeAttemptDb } from "@/lib/supabase/game";

const Body = z.object({ answer: z.unknown() });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "not_logged_in" }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  }
  const challenge = getChallengeById(id);
  if (!challenge) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  if (await hasChallengeAttempt(user.id, challenge.id)) {
    return NextResponse.json({ ok: false, error: "already" });
  }

  let correct = false;
  let awarded = 0;
  const answer = parsed.data.answer;

  switch (challenge.payload.type) {
    case "trivia": {
      const idx = typeof answer === "number" ? answer : -1;
      correct = idx === challenge.payload.data.correctIndex;
      awarded = correct ? challenge.points : 0;
      break;
    }
    case "poll": {
      const idx = typeof answer === "number" ? answer : -1;
      if (idx >= 0 && idx < challenge.payload.data.options.length) {
        if (!isSupabaseConfigured()) {
          addPollVote({
            userId: user.id,
            challengeId: challenge.id,
            optionIndex: idx,
            votedAt: new Date().toISOString(),
          });
        }
        correct = true;
        awarded = challenge.points;
      }
      break;
    }
    case "score_input": {
      const s = typeof answer === "string" ? answer.replace(/\s/g, "") : "";
      correct = s === challenge.payload.data.correctScore;
      awarded = correct ? challenge.points : Math.floor(challenge.points / 4);
      break;
    }
    case "bingo": {
      const ar = Array.isArray(answer) ? answer : [];
      correct = ar.length >= challenge.payload.data.rowSize;
      awarded = correct ? challenge.points : 0;
      break;
    }
    case "panna_qr":
    case "photo":
      correct = false;
      awarded = 0;
      break;
  }

  if (isSupabaseConfigured()) {
    const result = await submitChallengeAttemptDb(
      challenge.id,
      answer,
      correct,
      awarded
    );
    if (!result) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error });
    }
    const { newlyEarnedBadges } = await evaluateBadges(user.id);
    return NextResponse.json({
      ok: true,
      correct,
      awarded,
      totalPoints: result.total_points,
      newBadges: newlyEarnedBadges,
    });
  }

  addChallengeAttempt({
    id: `att-${user.id}-${challenge.id}-${Date.now()}`,
    userId: user.id,
    challengeId: challenge.id,
    answer,
    correct,
    awardedPoints: awarded,
    createdAt: new Date().toISOString(),
  });

  const { newlyEarnedBadges } = await evaluateBadges(user.id);

  return NextResponse.json({
    ok: true,
    correct,
    awarded,
    newBadges: newlyEarnedBadges,
  });
}
