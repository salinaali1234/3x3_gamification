import {
  totalPoints as memTotalPoints,
  wheelSpinsUsed as memWheelSpinsUsed,
  wheelSpinsAvailable as memWheelSpinsAvailable,
  wheelSpinsEarned as memWheelSpinsEarned,
  userCompletions as memUserCompletions,
  userAttempts as memUserAttempts,
  userClaims as memUserClaims,
  userMatchSubmissions as memUserMatchSubmissions,
  challengePoints as memChallengePoints,
  matchScorePoints as memMatchScorePoints,
  listRewards as memListRewards,
  getRewardById as memGetRewardById,
  getBadgeById as memGetBadgeById,
  userBadgesFor as memUserBadgesFor,
  leaderboard as memLeaderboard,
  listLiveMatches as memListLiveMatches,
  getLiveMatchById as memGetLiveMatchById,
  userWheelSpins as memUserWheelSpins,
  getWheelPrizeById as memGetWheelPrizeById,
} from "./store";
import type { LeaderboardRow } from "./store";
import type { LiveMatch } from "./types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getUserGameState } from "@/lib/supabase/game";
import { listRewardStockDb } from "@/lib/supabase/game";
import { getUserBadgesFromDb } from "@/lib/supabase/badges";
import { getLeaderboardDb } from "@/lib/supabase/leaderboard";
import {
  getUserPointsBalanceDb,
  syncMemCompletionsToDb,
} from "@/lib/supabase/challenges-v2";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  leaderboardV2,
  userPointsBalance as memUserPointsBalance,
} from "./challenges-v2";
import {
  getLiveMatchByIdDb,
  listLiveMatchesDb,
} from "@/lib/supabase/live-matches";
import { getUserWheelSpinsDb, type UserWheelSpinRow } from "@/lib/supabase/redemptions";
import type { Badge } from "./types";

export type { LeaderboardRow };

export async function getChallengePassPoints(userId: string): Promise<number> {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return memChallengePoints(userId) + memMatchScorePoints(userId);
    }
    const [attemptsRes, matchRes] = await Promise.all([
      supabase.from("challenge_attempts").select("awarded_points").eq("user_id", userId),
      supabase
        .from("match_score_submissions")
        .select("awarded_points")
        .eq("user_id", userId),
    ]);
    const fromChallenges = (attemptsRes.data ?? []).reduce(
      (sum, row) => sum + (row.awarded_points as number),
      0
    );
    const fromMatches = (matchRes.data ?? []).reduce(
      (sum, row) => sum + (row.awarded_points as number),
      0
    );
    return fromChallenges + fromMatches;
  }
  return memChallengePoints(userId) + memMatchScorePoints(userId);
}

export async function getUserPointsBalance(userId: string): Promise<number> {
  const mem = memUserPointsBalance(userId);
  if (isSupabaseConfigured()) {
    const db = await getUserPointsBalanceDb(userId);
    if (db !== null) return Math.max(db, mem);
  }
  return mem;
}

function mergeLeaderboardRows(
  db: LeaderboardRow[],
  mem: LeaderboardRow[]
): LeaderboardRow[] {
  const byUser = new Map<string, LeaderboardRow>();
  for (const row of db) byUser.set(row.userId, { ...row });
  for (const row of mem) {
    const existing = byUser.get(row.userId);
    byUser.set(row.userId, {
      rank: 0,
      userId: row.userId,
      displayName: existing?.displayName ?? row.displayName,
      avatarColor: existing?.avatarColor ?? row.avatarColor,
      points: Math.max(existing?.points ?? 0, row.points),
      badgeIds: existing?.badgeIds?.length ? existing.badgeIds : row.badgeIds,
      stepsDone: Math.max(existing?.stepsDone ?? 0, row.stepsDone),
    });
  }
  return Array.from(byUser.values())
    .filter((r) => r.points > 0)
    .sort(
      (a, b) =>
        b.points - a.points || a.displayName.localeCompare(b.displayName)
    )
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export async function syncUserV2Progress(userId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    await syncMemCompletionsToDb(userId);
  }
}

async function enrichLeaderboardProfiles(
  rows: LeaderboardRow[]
): Promise<LeaderboardRow[]> {
  if (rows.length === 0) return rows;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return rows;

  const ids = rows.map((r) => r.userId);
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_color")
    .in("id", ids);

  const byId = new Map(
    (data ?? []).map((p) => [
      p.id as string,
      {
        displayName: p.display_name as string,
        avatarColor: p.avatar_color as string,
      },
    ])
  );

  return rows.map((row) => {
    const profile = byId.get(row.userId);
    if (!profile) return row;
    return {
      ...row,
      displayName: profile.displayName,
      avatarColor: profile.avatarColor,
    };
  });
}

export async function getLeaderboard(limit = 100): Promise<LeaderboardRow[]> {
  const memRows = await enrichLeaderboardProfiles(leaderboardV2(limit));
  if (isSupabaseConfigured()) {
    const dbRows = await getLeaderboardDb(limit);
    return mergeLeaderboardRows(dbRows, memRows).slice(0, limit);
  }
  return memRows;
}

export async function listLiveMatches(): Promise<LiveMatch[]> {
  if (isSupabaseConfigured()) {
    return listLiveMatchesDb();
  }
  return memListLiveMatches();
}

export async function getLiveMatchById(id: string): Promise<LiveMatch | null> {
  if (isSupabaseConfigured()) {
    return getLiveMatchByIdDb(id);
  }
  return memGetLiveMatchById(id) ?? null;
}

export async function getTotalPoints(userId: string): Promise<number> {
  if (isSupabaseConfigured()) {
    const state = await getUserGameState(userId);
    if (state) return state.totalPoints;
  }
  return memTotalPoints(userId);
}

export async function getWheelSpinsUsed(userId: string): Promise<number> {
  if (isSupabaseConfigured()) {
    const state = await getUserGameState(userId);
    if (state) return state.wheelSpinsUsed;
  }
  return memWheelSpinsUsed(userId);
}

export async function getWheelSpinsAvailable(userId: string): Promise<number> {
  if (isSupabaseConfigured()) {
    const state = await getUserGameState(userId);
    if (state) return state.wheelSpinsAvailable;
  }
  return memWheelSpinsAvailable(userId);
}

export async function getWheelSpinsEarned(userId: string): Promise<number> {
  if (isSupabaseConfigured()) {
    const state = await getUserGameState(userId);
    if (state) return state.wheelSpinsEarned;
  }
  return memWheelSpinsEarned(userId);
}

export async function getCompletedStepIds(userId: string): Promise<Set<string>> {
  if (isSupabaseConfigured()) {
    const state = await getUserGameState(userId);
    if (state) return new Set(state.completedStepSlugs);
  }
  return new Set(memUserCompletions(userId).map((c) => c.stepId));
}

export async function getCompletedChallengeIds(userId: string): Promise<Set<string>> {
  if (isSupabaseConfigured()) {
    const state = await getUserGameState(userId);
    if (state) return new Set(state.completedChallengeSlugs);
  }
  return new Set(memUserAttempts(userId).map((a) => a.challengeId));
}

export async function hasChallengeAttempt(
  userId: string,
  challengeId: string
): Promise<boolean> {
  const done = await getCompletedChallengeIds(userId);
  return done.has(challengeId);
}

function slugFromJoin(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const slug = (value as { slug?: unknown }).slug;
  return typeof slug === "string" ? slug : null;
}

export async function getUserAttempts(userId: string) {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return memUserAttempts(userId);
    const { data } = await supabase
      .from("challenge_attempts")
      .select("challenge_id, awarded_points, correct, created_at, challenges(slug)")
      .eq("user_id", userId);
    return (data ?? []).map((row) => ({
      id: `${userId}-${row.challenge_id}`,
      userId,
      challengeId: slugFromJoin(row.challenges) ?? String(row.challenge_id),
      answer: null,
      correct: row.correct as boolean,
      awardedPoints: row.awarded_points as number,
      createdAt: row.created_at as string,
    }));
  }
  return memUserAttempts(userId);
}

export async function getStepCompletions(userId: string) {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return memUserCompletions(userId);
    const { data } = await supabase
      .from("step_completions")
      .select("completed_at, journey_steps(slug)")
      .eq("user_id", userId);
    return (data ?? []).map((row) => ({
      userId,
      stepId: slugFromJoin(row.journey_steps) ?? "",
      completedAt: row.completed_at as string,
    }));
  }
  return memUserCompletions(userId);
}

export async function getUserClaims(userId: string) {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data } = await supabase
        .from("reward_claims")
        .select("id, voucher_code, claimed_at, redeemed_at, rewards(slug)")
        .eq("user_id", userId);
      if (data) {
        return data.map((row) => ({
          id: row.id as string,
          rewardId: slugFromJoin(row.rewards) ?? "",
          voucherCode: row.voucher_code as string,
          claimedAt: row.claimed_at as string,
          redeemedAt: (row.redeemed_at as string | null) ?? null,
        }));
      }
    }
    const state = await getUserGameState(userId);
    if (state) {
      return state.claimedRewardSlugs.map((slug) => ({
        id: slug,
        rewardId: slug,
        voucherCode: "",
        claimedAt: "",
        redeemedAt: null,
      }));
    }
  }
  return memUserClaims(userId).map((c) => ({
    ...c,
    redeemedAt: c.redeemedAt ?? null,
  }));
}

export async function getUserMatchSubmissions(userId: string) {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return memUserMatchSubmissions(userId);
    const { data } = await supabase
      .from("match_score_submissions")
      .select("match_id, submitted_score, correct, awarded_points, created_at")
      .eq("user_id", userId);
    return (data ?? []).map((row) => ({
      userId,
      matchId: row.match_id as string,
      submittedScore: row.submitted_score as string,
      correct: row.correct as boolean,
      awardedPoints: row.awarded_points as number,
      createdAt: row.created_at as string,
    }));
  }
  return memUserMatchSubmissions(userId);
}

export async function getUserBadges(userId: string): Promise<Badge[]> {
  if (isSupabaseConfigured()) {
    return getUserBadgesFromDb(userId);
  }
  return memUserBadgesFor(userId)
    .map((ub) => memGetBadgeById(ub.badgeId))
    .filter(Boolean) as Badge[];
}

export async function getUserWheelSpins(userId: string): Promise<UserWheelSpinRow[]> {
  if (isSupabaseConfigured()) {
    return getUserWheelSpinsDb(userId);
  }
  return memUserWheelSpins(userId).map((spin) => {
    const prize = memGetWheelPrizeById(spin.prizeId);
    return {
      id: spin.id,
      pickupCode: spin.pickupCode ?? "",
      prizeId: spin.prizeId,
      emoji: prize?.emoji ?? "🎁",
      labelNl: prize?.label.nl ?? "",
      labelEn: prize?.label.en ?? "",
      createdAt: spin.createdAt,
      redeemedAt: spin.redeemedAt ?? null,
    };
  });
}

/** Rewards with live stock from Supabase when configured. */
export async function listRewardsWithStock() {
  const rewards = memListRewards();
  if (!isSupabaseConfigured()) return rewards;

  const stockRows = await listRewardStockDb();
  const stockBySlug = new Map(stockRows.map((r) => [r.slug, r.stock]));
  const costBySlug = new Map(stockRows.map((r) => [r.slug, r.costPoints]));
  return rewards.map((r) => ({
    ...r,
    stock: stockBySlug.get(r.id) ?? r.stock,
    costPoints: costBySlug.get(r.id) ?? r.costPoints,
  }));
}

export { memGetRewardById as getRewardById };
