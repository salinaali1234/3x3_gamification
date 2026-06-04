import { NextResponse } from "next/server";
import { z } from "zod";
import {
  addStepCompletion,
  addStepPhotoUpload,
  canCompleteStep,
  getJourneyStepById,
  wheelSpinsAvailable,
  wheelSpinsEarned,
} from "@/lib/data/store";
import { evaluateBadges } from "@/lib/award-points";
import { getCurrentUser } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { completeJourneyStepDb } from "@/lib/supabase/game";

const Body = z.object({
  stepId: z.string().min(1),
  /** data URL of the captured photo — stored as a placeholder in the mock store */
  photoDataUrl: z.string().min(1),
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
  const step = getJourneyStepById(parsed.data.stepId);
  if (!step) {
    return NextResponse.json({ ok: false, error: "invalid" });
  }
  if (step.verifyMethod !== "photo") {
    return NextResponse.json({ ok: false, error: "not_photo_step" });
  }
  if (!canCompleteStep(user.id, step.id)) {
    return NextResponse.json({ ok: false, error: "leader_hub_locked" });
  }

  if (isSupabaseConfigured()) {
    const result = await completeJourneyStepDb(step.id);
    if (!result) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error });
    }
    addStepPhotoUpload(user.id, step.id, parsed.data.photoDataUrl.slice(0, 64));
    const { newlyEarnedBadges } = evaluateBadges(user.id);
    return NextResponse.json({
      ok: true,
      type: "step",
      target: { id: step.id, title: step.title },
      pointsGained: result.points_gained,
      totalPoints: result.total_points,
      wheelSpinsGained: result.wheel_spins_gained,
      wheelSpinsAvailable: result.wheel_spins_available,
      newBadges: newlyEarnedBadges,
    });
  }

  const earnedBefore = wheelSpinsEarned(user.id);
  const added = addStepCompletion(user.id, step.id);
  if (!added) {
    return NextResponse.json({ ok: false, error: "already" });
  }
  addStepPhotoUpload(user.id, step.id, parsed.data.photoDataUrl.slice(0, 64));
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
