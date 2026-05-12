import {
  awardBadge,
  listBadges,
  userAttempts,
  userCompletions,
  listJourneySteps,
  getStore,
} from "@/lib/data/store";
import type { Badge } from "@/lib/data/types";

export type AwardResult = {
  newlyEarnedBadges: Badge[];
};

export function evaluateBadges(userId: string): AwardResult {
  const newly: Badge[] = [];
  const badges = listBadges();
  const stepsDone = userCompletions(userId).length;
  const totalSteps = listJourneySteps().length;
  const correctAttempts = userAttempts(userId).filter((a) => a.correct).length;
  const hasPhoto = getStore().photos.some((p) => p.userId === userId);
  const hasCorrectScore = userAttempts(userId).some(
    (a) => a.correct && getStore().challenges.find((c) => c.id === a.challengeId)?.type === "score_input"
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
