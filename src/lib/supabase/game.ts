import type { Locale } from "@/lib/i18n/config";
import { computeWheelSpinsEarned } from "@/lib/wheel/spins";
import { isSupabaseConfigured } from "./env";
import { createSupabaseServerClient } from "./server";
import { ensureCatalogSeeded } from "./seed-catalog";

export const POINTS_PER_WHEEL_SPIN = 200;

function slugFromJoin(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const slug = (value as { slug?: unknown }).slug;
  return typeof slug === "string" ? slug : null;
}

export type UserGameState = {
  totalPoints: number;
  completedStepSlugs: string[];
  completedChallengeSlugs: string[];
  wheelSpinsUsed: number;
  wheelSpinsEarned: number;
  wheelSpinsAvailable: number;
  claimedRewardSlugs: string[];
};

export async function ensureGameReady(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await ensureCatalogSeeded();
}

export async function getUserGameState(userId: string): Promise<UserGameState | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const [
    profileRes,
    stepsRes,
    attemptsRes,
    spinsRes,
    claimsRes,
    journeyCountRes,
  ] = await Promise.all([
    supabase.from("profiles").select("total_points").eq("id", userId).maybeSingle(),
    supabase
      .from("step_completions")
      .select("journey_steps(slug)")
      .eq("user_id", userId),
    supabase
      .from("challenge_attempts")
      .select("challenges(slug)")
      .eq("user_id", userId),
    supabase.from("wheel_spins").select("prize_id").eq("user_id", userId),
    supabase
      .from("reward_claims")
      .select("rewards(slug)")
      .eq("user_id", userId),
    supabase.from("journey_steps").select("id", { count: "exact", head: true }),
  ]);

  const totalPoints = profileRes.data?.total_points ?? 0;
  const completedStepSlugs = (stepsRes.data ?? [])
    .map((r) => slugFromJoin(r.journey_steps))
    .filter(Boolean) as string[];
  const completedChallengeSlugs = (attemptsRes.data ?? [])
    .map((r) => slugFromJoin(r.challenges))
    .filter(Boolean) as string[];
  const wheelSpinsUsed = spinsRes.data?.length ?? 0;
  const { data: earnedRpc } = await supabase.rpc("wheel_spins_earned", {
    p_user_id: userId,
  });
  const wheelSpinsEarned =
    typeof earnedRpc === "number"
      ? earnedRpc
      : computeWheelSpinsEarned(
          completedStepSlugs.length,
          journeyCountRes.count ?? 0,
          spinsRes.data?.filter((s) => s.prize_id === "wp-spin-again").length ?? 0
        );
  const totalJourneySteps = journeyCountRes.count ?? 0;
  const claimedRewardSlugs = (claimsRes.data ?? [])
    .map((r) => slugFromJoin(r.rewards))
    .filter(Boolean) as string[];

  return {
    totalPoints,
    completedStepSlugs,
    completedChallengeSlugs,
    wheelSpinsUsed,
    wheelSpinsEarned,
    wheelSpinsAvailable: Math.max(0, wheelSpinsEarned - wheelSpinsUsed),
    claimedRewardSlugs,
  };
}

export async function completeJourneyStepDb(stepSlug: string) {
  await ensureGameReady();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("complete_journey_step", {
    p_slug: stepSlug,
  });
  if (error) return { ok: false as const, error: error.message };
  return data as Record<string, unknown>;
}

export async function completeChallengeScanDb(challengeSlug: string) {
  await ensureGameReady();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("complete_challenge_scan", {
    p_slug: challengeSlug,
  });
  if (error) return { ok: false as const, error: error.message };
  return data as Record<string, unknown>;
}

export async function submitChallengeAttemptDb(
  challengeSlug: string,
  answer: unknown,
  correct: boolean,
  awardedPoints: number
) {
  await ensureGameReady();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("submit_challenge_attempt", {
    p_slug: challengeSlug,
    p_answer: answer,
    p_correct: correct,
    p_awarded_points: awardedPoints,
  });
  if (error) return { ok: false as const, error: error.message };
  return data as Record<string, unknown>;
}

export async function spinWheelDb() {
  await ensureGameReady();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("spin_wheel");
  if (error) return { ok: false as const, error: error.message };
  return data as Record<string, unknown>;
}

export type CodeLookup = {
  targetType: "step" | "challenge";
  targetSlug: string;
};

export async function lookupCodeDb(code: string): Promise<CodeLookup | null> {
  await ensureGameReady();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const normalized = code.trim().toUpperCase();
  const { data: row, error } = await supabase
    .from("codes")
    .select("target_type, target_id, active")
    .eq("code", normalized)
    .maybeSingle();

  if (error || !row || !row.active) return null;

  if (row.target_type === "step") {
    const { data: step } = await supabase
      .from("journey_steps")
      .select("slug")
      .eq("id", row.target_id)
      .maybeSingle();
    if (!step?.slug) return null;
    return { targetType: "step", targetSlug: step.slug as string };
  }

  const { data: challenge } = await supabase
    .from("challenges")
    .select("slug")
    .eq("id", row.target_id)
    .maybeSingle();
  if (!challenge?.slug) return null;
  return { targetType: "challenge", targetSlug: challenge.slug as string };
}

export async function submitMatchScoreDb(
  matchId: string,
  score: string,
  correct: boolean,
  awardedPoints: number
) {
  await ensureGameReady();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("submit_match_score", {
    p_match_id: matchId,
    p_score: score,
    p_correct: correct,
    p_awarded_points: awardedPoints,
  });
  if (error) return { ok: false as const, error: error.message };
  return data as Record<string, unknown>;
}

export async function claimRewardDb(rewardSlug: string, voucherCode: string) {
  await ensureGameReady();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("claim_reward", {
    p_slug: rewardSlug,
    p_voucher_code: voucherCode,
  });
  if (error) return { ok: false as const, error: error.message };
  return data as Record<string, unknown>;
}

export async function listRewardStockDb(): Promise<
  Array<{ slug: string; stock: number; costPoints: number }>
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("rewards")
    .select("slug, stock, cost_points");
  return (data ?? []).map((r) => ({
    slug: r.slug as string,
    stock: r.stock as number,
    costPoints: r.cost_points as number,
  }));
}

export async function listWheelPrizeStockDb(): Promise<
  Array<{ id: string; stock: number; unlimited: boolean }>
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("wheel_prizes")
    .select("id, stock, unlimited");
  return (data ?? []).map((r) => ({
    id: r.id as string,
    stock: r.stock as number,
    unlimited: r.unlimited as boolean,
  }));
}

export function wheelPrizeLabel(
  prize: { label_nl: string; label_en: string },
  locale: Locale
) {
  return locale === "nl" ? prize.label_nl : prize.label_en;
}
