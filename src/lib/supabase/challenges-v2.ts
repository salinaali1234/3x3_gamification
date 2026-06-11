import { createSupabaseServerClient } from "./server";
import {
  getUnifiedChallengeById,
  userCompletions,
} from "@/lib/data/challenges-v2";

export async function completeChallengeDb(
  challengeId: string,
  submittedCode?: string
): Promise<
  | { ok: true; pointsAwarded: number }
  | { ok: false; error: string }
> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "not_configured" };

  const { data, error } = await supabase.rpc("complete_challenge_v2", {
    p_challenge_id: challengeId,
    p_submitted_code: submittedCode ?? null,
  });

  if (error) return { ok: false, error: error.message };

  const result = data as { ok?: boolean; error?: string; points_awarded?: number };
  if (!result?.ok) {
    return { ok: false, error: result.error ?? "unknown" };
  }

  return { ok: true, pointsAwarded: result.points_awarded ?? 0 };
}

/** Persist in-memory v2 completions for the logged-in user (session backfill). */
export async function syncMemCompletionsToDb(userId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  for (const completion of userCompletions(userId)) {
    const chal = getUnifiedChallengeById(completion.challengeId);
    if (!chal) continue;

    let submittedCode: string | undefined;
    if (chal.verification === "code") submittedCode = chal.code;
    else if (chal.verification === "fence") {
      submittedCode = chal.letters?.join("");
    }

    const result = await completeChallengeDb(completion.challengeId, submittedCode);
    if (!result.ok && result.error !== "already_completed") {
      // Best-effort sync; ignore validation mismatches from seed drift.
    }
  }
}

export async function getUserPointsBalanceDb(userId: string): Promise<number | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const [earnedRes, spentRes] = await Promise.all([
    supabase
      .from("challenge_completions_v2")
      .select("points_awarded")
      .eq("user_id", userId),
    supabase
      .from("prize_redemptions_v2")
      .select("cost_points")
      .eq("user_id", userId),
  ]);

  if (earnedRes.error && spentRes.error) return null;

  const earned = (earnedRes.data ?? []).reduce(
    (sum, row) => sum + (row.points_awarded as number),
    0
  );
  const spent = (spentRes.data ?? []).reduce(
    (sum, row) => sum + (row.cost_points as number),
    0
  );
  return earned - spent;
}
