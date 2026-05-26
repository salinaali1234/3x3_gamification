import { NextResponse } from "next/server";
import { z } from "zod";
import {
  addChallengeAttempt,
  addStepCompletion,
  canCompleteStep,
  getChallengeById,
  getJourneyStepById,
  getQrCode,
  hasChallengeAttempt,
  wheelSpinsAvailable,
  wheelSpinsEarned,
} from "@/lib/data/store";
import { evaluateBadges } from "@/lib/award-points";
import { getCurrentUser } from "@/lib/session";

const Body = z.object({ code: z.string().min(1) });

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
  const qr = getQrCode(parsed.data.code.trim());
  if (!qr) {
    return NextResponse.json({ ok: false, error: "invalid" });
  }

  if (qr.targetType === "step") {
    const step = getJourneyStepById(qr.targetId);
    if (!step) {
      return NextResponse.json({ ok: false, error: "invalid" });
    }
    if (step.verifyMethod === "photo") {
      return NextResponse.json({ ok: false, error: "photo_required" });
    }
    if (!canCompleteStep(user.id, step.id)) {
      return NextResponse.json({ ok: false, error: "leader_hub_locked" });
    }
    const earnedBefore = wheelSpinsEarned(user.id);
    const added = addStepCompletion(user.id, step.id);
    if (!added) {
      return NextResponse.json({ ok: false, error: "already" });
    }
    const spinsGained = wheelSpinsEarned(user.id) - earnedBefore;
    const { newlyEarnedBadges } = evaluateBadges(user.id);
    return NextResponse.json({
      ok: true,
      type: "step",
      target: { id: step.id, title: step.title },
      wheelSpinsGained: spinsGained,
      wheelSpinsAvailable: wheelSpinsAvailable(user.id),
      newBadges: newlyEarnedBadges,
    });
  }

  // challenge type (e.g. panna_qr)
  const ch = getChallengeById(qr.targetId);
  if (!ch) {
    return NextResponse.json({ ok: false, error: "invalid" });
  }
  if (hasChallengeAttempt(user.id, ch.id)) {
    return NextResponse.json({ ok: false, error: "already" });
  }
  addChallengeAttempt({
    id: `att-${user.id}-${ch.id}-${Date.now()}`,
    userId: user.id,
    challengeId: ch.id,
    answer: { scanned: parsed.data.code },
    correct: true,
    awardedPoints: ch.points,
    createdAt: new Date().toISOString(),
  });
  const { newlyEarnedBadges } = evaluateBadges(user.id);
  return NextResponse.json({
    ok: true,
    type: "challenge",
    target: { id: ch.id, title: ch.title, points: ch.points },
    newBadges: newlyEarnedBadges,
  });
}
