import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PrizeLookupRow = {
  id: string;
  kind: "reward" | "wheel";
  code: string;
  claimedAt: string;
  redeemedAt: string | null;
  redeemedByName: string | null;
  userId: string;
  email: string;
  displayName: string;
  emoji: string;
  labelNl: string;
  labelEn: string;
  rewardSlug?: string;
  prizeId?: string;
};

export type PrizeLookupResult = {
  ok: true;
  query: string;
  items: PrizeLookupRow[];
};

function mapRewardRow(row: Record<string, unknown>): PrizeLookupRow {
  return {
    id: row.id as string,
    kind: "reward",
    code: row.code as string,
    claimedAt: row.claimed_at as string,
    redeemedAt: (row.redeemed_at as string | null) ?? null,
    redeemedByName: (row.redeemed_by_name as string | null) ?? null,
    userId: row.user_id as string,
    email: row.email as string,
    displayName: row.display_name as string,
    emoji: row.emoji as string,
    labelNl: row.name_nl as string,
    labelEn: row.name_en as string,
    rewardSlug: row.reward_slug as string | undefined,
  };
}

function mapWheelRow(row: Record<string, unknown>): PrizeLookupRow {
  return {
    id: row.id as string,
    kind: "wheel",
    code: row.code as string,
    claimedAt: row.claimed_at as string,
    redeemedAt: (row.redeemed_at as string | null) ?? null,
    redeemedByName: (row.redeemed_by_name as string | null) ?? null,
    userId: row.user_id as string,
    email: row.email as string,
    displayName: row.display_name as string,
    emoji: row.emoji as string,
    labelNl: row.label_nl as string,
    labelEn: row.label_en as string,
    prizeId: row.prize_id as string | undefined,
  };
}

export async function lookupPrizeCodeDb(query: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("lookup_prize_code", {
    p_query: query.trim(),
  });
  if (error) return { ok: false as const, error: error.message };
  const payload = data as Record<string, unknown>;
  if (!payload.ok) return payload as { ok: false; error: string };
  const rewardClaims = (payload.reward_claims as Record<string, unknown>[]) ?? [];
  const wheelSpins = (payload.wheel_spins as Record<string, unknown>[]) ?? [];
  return {
    ok: true as const,
    query: String(payload.query ?? query),
    items: [
      ...rewardClaims.map(mapRewardRow),
      ...wheelSpins.map(mapWheelRow),
    ].sort(
      (a, b) =>
        new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime()
    ),
  } satisfies PrizeLookupResult;
}

export async function markRewardRedeemedDb(voucherCode: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("mark_reward_redeemed", {
    p_voucher_code: voucherCode.trim(),
  });
  if (error) return { ok: false as const, error: error.message };
  return data as Record<string, unknown>;
}

export async function markWheelRedeemedDb(pickupCode: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("mark_wheel_redeemed", {
    p_pickup_code: pickupCode.trim(),
  });
  if (error) return { ok: false as const, error: error.message };
  return data as Record<string, unknown>;
}

export type UserWheelSpinRow = {
  id: string;
  pickupCode: string;
  prizeId: string;
  emoji: string;
  labelNl: string;
  labelEn: string;
  createdAt: string;
  redeemedAt: string | null;
};

export async function getUserWheelSpinsDb(userId: string): Promise<UserWheelSpinRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("wheel_spins")
    .select(
      "id, pickup_code, prize_id, created_at, redeemed_at, wheel_prizes(emoji, label_nl, label_en)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => {
    const prizeRaw = row.wheel_prizes as
      | { emoji: string; label_nl: string; label_en: string }
      | { emoji: string; label_nl: string; label_en: string }[]
      | null;
    const prize = Array.isArray(prizeRaw) ? prizeRaw[0] : prizeRaw;
    return {
      id: row.id as string,
      pickupCode: (row.pickup_code as string) ?? "",
      prizeId: row.prize_id as string,
      emoji: prize?.emoji ?? "🎁",
      labelNl: prize?.label_nl ?? "",
      labelEn: prize?.label_en ?? "",
      createdAt: row.created_at as string,
      redeemedAt: (row.redeemed_at as string | null) ?? null,
    };
  });
}
