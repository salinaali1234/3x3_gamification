import {
  totalPoints as memTotalPoints,
  wheelSpinsAvailable as memWheelSpinsAvailable,
  wheelSpinsEarned as memWheelSpinsEarned,
  userCompletions as memUserCompletions,
  userAttempts as memUserAttempts,
  userClaims as memUserClaims,
  listRewards as memListRewards,
  getRewardById as memGetRewardById,
} from "./store";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getUserGameState } from "@/lib/supabase/game";
import { listRewardStockDb } from "@/lib/supabase/game";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getTotalPoints(userId: string): Promise<number> {
  if (isSupabaseConfigured()) {
    const state = await getUserGameState(userId);
    if (state) return state.totalPoints;
  }
  return memTotalPoints(userId);
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
        .select("id, voucher_code, claimed_at, rewards(slug)")
        .eq("user_id", userId);
      if (data) {
        return data.map((row) => ({
          id: row.id as string,
          rewardId: slugFromJoin(row.rewards) ?? "",
          voucherCode: row.voucher_code as string,
          claimedAt: row.claimed_at as string,
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
      }));
    }
  }
  return memUserClaims(userId);
}

/** Rewards with live stock from Supabase when configured. */
export async function listRewardsWithStock() {
  const rewards = memListRewards();
  if (!isSupabaseConfigured()) return rewards;

  const stockRows = await listRewardStockDb();
  const stockBySlug = new Map(stockRows.map((r) => [r.slug, r.stock]));
  return rewards.map((r) => ({
    ...r,
    stock: stockBySlug.get(r.id) ?? r.stock,
  }));
}

export { memGetRewardById as getRewardById };
