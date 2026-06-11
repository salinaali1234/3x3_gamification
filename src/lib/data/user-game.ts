/**
 * User game state — unified challenges v2.
 *
 * Reads from the in-memory v2 store (src/lib/data/challenges-v2.ts).
 * Once Supabase migration 0015 is applied, swap reads to challenges_v2 tables.
 */
import {
  userCompletions as memUserCompletions,
  userAttempts as memUserAttempts,
  userMatchSubmissions as memUserMatchSubmissions,
  getBadgeById as memGetBadgeById,
  userBadgesFor as memUserBadgesFor,
  leaderboard as memLeaderboard,
  listLiveMatches as memListLiveMatches,
  getLiveMatchById as memGetLiveMatchById,
} from "./store";
import type { LeaderboardRow } from "./store";
import type { LiveMatch, Badge } from "./types";
import {
  userPointsBalance,
  userPointsEarned,
  userCompletedIds as v2UserCompletedIds,
  userCompletions as v2UserCompletions,
  userRedemptions as v2UserRedemptions,
} from "./challenges-v2";

export type { LeaderboardRow };

/** Current spendable points (earned − spent). */
export async function getChallengePassPoints(userId: string): Promise<number> {
  return userPointsBalance(userId);
}

/** Total earned (used for leaderboard ranking). */
export async function getTotalPointsEarned(userId: string): Promise<number> {
  return userPointsEarned(userId);
}

/** Leaderboard — still backed by mock leaderboard for now. */
export async function getLeaderboard(limit = 100): Promise<LeaderboardRow[]> {
  return memLeaderboard(limit);
}

export async function listLiveMatches(): Promise<LiveMatch[]> {
  return memListLiveMatches();
}

export async function getLiveMatchById(id: string): Promise<LiveMatch | null> {
  return memGetLiveMatchById(id) ?? null;
}

/** Legacy: total points used by old screens. Use getChallengePassPoints instead. */
export async function getTotalPoints(userId: string): Promise<number> {
  return userPointsBalance(userId);
}

export async function getCompletedChallengeIds(userId: string): Promise<Set<string>> {
  return v2UserCompletedIds(userId);
}

/** @deprecated journey removed — kept as no-op for legacy callers. */
export async function getCompletedStepIds(_userId: string): Promise<Set<string>> {
  return new Set();
}

export async function hasChallengeAttempt(
  userId: string,
  challengeId: string
): Promise<boolean> {
  return v2UserCompletedIds(userId).has(challengeId);
}

/** Completions in the new format (for profile / dashboard). */
export async function getUnifiedCompletions(userId: string) {
  return v2UserCompletions(userId);
}

export async function getUnifiedRedemptions(userId: string) {
  return v2UserRedemptions(userId);
}

// ---------- Legacy passthroughs (kept so existing pages don't crash) ----------

export async function getUserAttempts(userId: string) {
  return memUserAttempts(userId);
}

export async function getStepCompletions(userId: string) {
  return memUserCompletions(userId);
}

export async function getUserMatchSubmissions(userId: string) {
  return memUserMatchSubmissions(userId);
}

export async function getUserBadges(userId: string): Promise<Badge[]> {
  return memUserBadgesFor(userId)
    .map((ub) => memGetBadgeById(ub.badgeId))
    .filter(Boolean) as Badge[];
}
