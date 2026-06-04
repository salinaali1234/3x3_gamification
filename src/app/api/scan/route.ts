import { NextResponse } from "next/server";
import { z } from "zod";
import {
  addChallengeAttempt,
  addStepCompletion,
  getChallengeById,
  getJourneyStepById,
  getQrCode,
  hasChallengeAttempt,
  journeyStepsCompleted,
  listJourneySteps,
  totalPoints,
  wheelSpinsAvailable,
  wheelSpinsEarned,
} from "@/lib/data/store";
import { journeyStepsUntilWheelSpin } from "@/lib/wheel/spins";
import { evaluateBadges } from "@/lib/award-points";
import { getCurrentUser } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  completeChallengeScanDb,
  completeJourneyStepDb,
} from "@/lib/supabase/game";

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

    if (isSupabaseConfigured()) {
      const result = await completeJourneyStepDb(step.id);
      if (!result) {
        return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
      }
      if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error });
      }
      const { newlyEarnedBadges } = evaluateBadges(user.id);
      return NextResponse.json({
        ok: true,
        type: "step",
        target: { id: step.id, title: step.title, points: step.points },
        pointsGained: result.points_gained,
        totalPoints: result.total_points,
        wheelSpinsGained: result.wheel_spins_gained,
        wheelSpinsAvailable: result.wheel_spins_available,
        journeyStepsRemaining: journeyStepsUntilWheelSpin(
          Number(result.journey_steps_done ?? 0),
          Number(result.journey_steps_total ?? listJourneySteps().length)
        ),
        journeyComplete: result.journey_complete,
        newBadges: newlyEarnedBadges,
      });
    }

    const pointsBefore = totalPoints(user.id);
    const spinsBefore = wheelSpinsEarned(user.id);
    const added = addStepCompletion(user.id, step.id);
    if (!added) {
      return NextResponse.json({ ok: false, error: "already" });
    }
    const pointsAfter = totalPoints(user.id);
    const totalSteps = listJourneySteps().length;
    const stepsDone = journeyStepsCompleted(user.id);
    const spinsGained = wheelSpinsEarned(user.id) - spinsBefore;
    const { newlyEarnedBadges } = evaluateBadges(user.id);
    return NextResponse.json({
      ok: true,
      type: "step",
      target: { id: step.id, title: step.title, points: step.points },
      pointsGained: pointsAfter - pointsBefore,
      totalPoints: pointsAfter,
      wheelSpinsGained: spinsGained,
      wheelSpinsAvailable: wheelSpinsAvailable(user.id),
      journeyStepsRemaining: journeyStepsUntilWheelSpin(stepsDone, totalSteps),
      journeyComplete: stepsDone >= totalSteps,
      newBadges: newlyEarnedBadges,
    });
  }

  const ch = getChallengeById(qr.targetId);
  if (!ch) {
    return NextResponse.json({ ok: false, error: "invalid" });
  }

  if (isSupabaseConfigured()) {
    const result = await completeChallengeScanDb(ch.id);
    if (!result) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error });
    }
    const { newlyEarnedBadges } = evaluateBadges(user.id);
    return NextResponse.json({
      ok: true,
      type: "challenge",
      target: { id: ch.id, title: ch.title, points: ch.points },
      pointsGained: result.points_gained,
      totalPoints: result.total_points,
      wheelSpinsGained: result.wheel_spins_gained,
      wheelSpinsAvailable: result.wheel_spins_available,
      newBadges: newlyEarnedBadges,
    });
  }

  if (hasChallengeAttempt(user.id, ch.id)) {
    return NextResponse.json({ ok: false, error: "already" });
  }
  const spinsBefore = wheelSpinsEarned(user.id);
  addChallengeAttempt({
    id: `att-${user.id}-${ch.id}-${Date.now()}`,
    userId: user.id,
    challengeId: ch.id,
    answer: { scanned: parsed.data.code },
    correct: true,
    awardedPoints: ch.points,
    createdAt: new Date().toISOString(),
  });
  const spinsGained = wheelSpinsEarned(user.id) - spinsBefore;
  const pts = totalPoints(user.id);
  const { newlyEarnedBadges } = evaluateBadges(user.id);
  return NextResponse.json({
    ok: true,
    type: "challenge",
    target: { id: ch.id, title: ch.title, points: ch.points },
    pointsGained: ch.points,
    totalPoints: pts,
    wheelSpinsGained: spinsGained,
    wheelSpinsAvailable: wheelSpinsAvailable(user.id),
    newBadges: newlyEarnedBadges,
  });
}
