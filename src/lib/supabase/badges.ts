import {
  getChallengeById,
  listBadges,
  listJourneySteps,
} from "@/lib/data/store";
import type { Badge } from "@/lib/data/types";
import { createSupabaseServerClient } from "./server";

function slugFromJoin(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const slug = (value as { slug?: unknown }).slug;
  return typeof slug === "string" ? slug : null;
}

export async function awardBadgeDb(badgeCode: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false as const, error: "db_error" };
  const { data, error } = await supabase.rpc("award_badge", {
    p_badge_code: badgeCode,
  });
  if (error) return { ok: false as const, error: error.message };
  return data as { ok: boolean; error?: string; badge_code?: string };
}

export async function getUserBadgesFromDb(userId: string): Promise<Badge[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("user_badges")
    .select("badges(code)")
    .eq("user_id", userId);

  const codes = (data ?? [])
    .map((row) => {
      const badge = row.badges;
      if (!badge || typeof badge !== "object") return null;
      return (badge as { code?: string }).code ?? null;
    })
    .filter(Boolean) as string[];

  return codes
    .map((code) => listBadges().find((b) => b.code === code))
    .filter(Boolean) as Badge[];
}

export async function evaluateBadgesDb(userId: string): Promise<Badge[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const [stepsRes, attemptsRes, photosRes] = await Promise.all([
    supabase
      .from("step_completions")
      .select("journey_steps(slug)")
      .eq("user_id", userId),
    supabase
      .from("challenge_attempts")
      .select("correct, challenges(slug, type)")
      .eq("user_id", userId),
    supabase
      .from("photos")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  const stepsDone = (stepsRes.data ?? []).length;
  const totalSteps = listJourneySteps().length;
  const attempts = (attemptsRes.data ?? []).map((row) => ({
    correct: row.correct as boolean,
    challengeId: slugFromJoin(row.challenges) ?? "",
    challengeType:
      row.challenges && typeof row.challenges === "object"
        ? ((row.challenges as { type?: string }).type ?? null)
        : null,
  }));
  const correctAttempts = attempts.filter((a) => a.correct).length;
  const hasPhoto = (photosRes.count ?? 0) > 0;
  const hasCorrectScore = attempts.some((a) => {
    if (!a.correct) return false;
    if (a.challengeType === "score_input") return true;
    return getChallengeById(a.challengeId)?.type === "score_input";
  });

  const newly: Badge[] = [];

  for (const badge of listBadges()) {
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

    if (!qualifies) continue;

    const result = await awardBadgeDb(badge.code);
    if (result.ok) newly.push(badge);
  }

  return newly;
}
