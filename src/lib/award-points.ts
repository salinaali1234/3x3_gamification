import {
  awardBadge,
  getChallengeById,
  listBadges,
  listJourneySteps,
  userAttempts,
  userCompletions,
  getStore,
} from "@/lib/data/store";
import type { Badge } from "@/lib/data/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { evaluateBadgesDb } from "@/lib/supabase/badges";

export type AwardResult = {
  newlyEarnedBadges: Badge[];
};

function evaluateBadgesMem(userId: string): AwardResult {
  const newly: Badge[] = [];
  const badges = listBadges();
  const stepsDone = userCompletions(userId).length;
  const totalSteps = listJourneySteps().length;
  const correctAttempts = userAttempts(userId).filter((a) => a.correct).length;
  const hasPhoto = getStore().photos.some((p) => p.userId === userId);
  const hasCorrectScore = userAttempts(userId).some(
    (a) =>
      a.correct &&
      getChallengeById(a.challengeId)?.type === "score_input"
  );

  for (const badge of badges) {
    let qualifies = false;
    switch (badge.criterion.kind) {
      case "steps_completed":
        qualifies = stepsDone >= (badge.criterion.threshold ?? 1);
        break;
      case "all_steps":
        qualifies = stepsDone >= totalSteps;
        break;
      case "challenges_completed":
        qualifies = correctAttempts >= (badge.criterion.threshold ?? 1);
        break;
      case "photo_uploaded":
        qualifies = hasPhoto;
        break;
      case "score_correct":
        qualifies = hasCorrectScore;
        break;
      case "early_check_in":
        qualifies = stepsDone >= 1;
        break;
    }
    if (qualifies && awardBadge(userId, badge.id)) {
      newly.push(badge);
    }
  }

  return { newlyEarnedBadges: newly };
}

export async function evaluateBadges(userId: string): Promise<AwardResult> {
  if (isSupabaseConfigured()) {
    const newlyEarnedBadges = await evaluateBadgesDb(userId);
    return { newlyEarnedBadges };
  }
  return evaluateBadgesMem(userId);
}
