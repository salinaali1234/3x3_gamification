import { createSupabaseServiceRoleClient } from "./admin";
import { isSupabaseConfigured } from "./env";
import { createSupabaseServerClient } from "./server";
import {
  SEED_BADGES,
  SEED_CHALLENGES,
  SEED_JOURNEY_STEPS,
  SEED_REWARDS,
  SEED_WHEEL_PRIZES,
  buildSeedQrCodes,
} from "@/lib/data/seed";
import { SEED_LIVE_MATCHES } from "@/lib/data/schedule-seed";

let seeded = false;

type SeedResult = {
  ok: boolean;
  journeySteps: number;
  challenges: number;
  badges: number;
  codes: number;
  rewards: number;
  wheelPrizes: number;
  liveMatches: number;
  errors: string[];
};

/** Idempotent catalog seed into Supabase (requires service role key). */
export async function ensureCatalogSeeded(): Promise<boolean> {
  const result = await seedCatalog();
  return result.ok;
}

export async function seedCatalog(): Promise<SeedResult> {
  const result: SeedResult = {
    ok: false,
    journeySteps: 0,
    challenges: 0,
    badges: 0,
    codes: 0,
    rewards: 0,
    wheelPrizes: 0,
    liveMatches: 0,
    errors: [],
  };

  if (!isSupabaseConfigured()) {
    result.errors.push("Supabase URL/anon key not configured");
    return result;
  }

  if (seeded) {
    result.ok = true;
    return result;
  }

  const admin = createSupabaseServiceRoleClient();
  if (!admin) {
    result.errors.push("SUPABASE_SERVICE_ROLE_KEY missing");
    return result;
  }

  for (const step of SEED_JOURNEY_STEPS) {
    const { error } = await admin.from("journey_steps").upsert(
      {
        slug: step.id,
        step_order: step.order,
        code: step.code,
        title_nl: step.title.nl,
        title_en: step.title.en,
        location_nl: step.location.nl,
        location_en: step.location.en,
        description_nl: step.description.nl,
        description_en: step.description.en,
        points: step.points,
        accent: step.accent,
      },
      { onConflict: "slug" }
    );
    if (error) result.errors.push(`journey_steps/${step.id}: ${error.message}`);
    else result.journeySteps++;
  }

  for (const ch of SEED_CHALLENGES) {
    const { error } = await admin.from("challenges").upsert(
      {
        slug: ch.id,
        type: ch.type,
        title_nl: ch.title.nl,
        title_en: ch.title.en,
        description_nl: ch.description.nl,
        description_en: ch.description.en,
        points: ch.points,
        accent: ch.accent,
        payload: ch.payload,
      },
      { onConflict: "slug" }
    );
    if (error) result.errors.push(`challenges/${ch.id}: ${error.message}`);
    else result.challenges++;
  }

  for (const badge of SEED_BADGES) {
    const { error } = await admin.from("badges").upsert(
      {
        code: badge.code,
        name_nl: badge.name.nl,
        name_en: badge.name.en,
        description_nl: badge.description.nl,
        description_en: badge.description.en,
        emoji: badge.emoji,
        accent: badge.accent,
        criterion: badge.criterion,
      },
      { onConflict: "code" }
    );
    if (error) result.errors.push(`badges/${badge.code}: ${error.message}`);
    else result.badges++;
  }

  const { count: rewardCount } = await admin
    .from("rewards")
    .select("*", { count: "exact", head: true });

  if ((rewardCount ?? 0) === 0) {
    for (const rw of SEED_REWARDS) {
      const { error } = await admin.from("rewards").insert({
        slug: rw.id,
        name_nl: rw.name.nl,
        name_en: rw.name.en,
        description_nl: rw.description.nl,
        description_en: rw.description.en,
        type: rw.type,
        cost_points: rw.costPoints,
        stock: rw.stock,
        emoji: rw.emoji,
        accent: rw.accent,
      });
      if (error) result.errors.push(`rewards/${rw.id}: ${error.message}`);
      else result.rewards++;
    }
  }

  for (const wp of SEED_WHEEL_PRIZES) {
    const { error } = await admin.from("wheel_prizes").upsert(
      {
        id: wp.id,
        label_nl: wp.label.nl,
        label_en: wp.label.en,
        emoji: wp.emoji,
        weight: wp.weight,
        stock: wp.id === "wp-spin-again" ? 0 : defaultWheelStock(wp.id),
        unlimited: wp.id === "wp-spin-again",
      },
      { onConflict: "id" }
    );
    if (error) result.errors.push(`wheel_prizes/${wp.id}: ${error.message}`);
    else result.wheelPrizes++;
  }

  const stepRows = await admin.from("journey_steps").select("id, slug");
  const challengeRows = await admin.from("challenges").select("id, slug");
  const stepIdBySlug = new Map(
    (stepRows.data ?? []).map((r) => [r.slug as string, r.id as string])
  );
  const challengeIdBySlug = new Map(
    (challengeRows.data ?? []).map((r) => [r.slug as string, r.id as string])
  );

  for (const qr of buildSeedQrCodes()) {
    const targetId =
      qr.targetType === "step"
        ? stepIdBySlug.get(qr.targetId)
        : challengeIdBySlug.get(qr.targetId);
    if (!targetId) {
      result.errors.push(`codes/${qr.code}: missing target ${qr.targetId}`);
      continue;
    }
    const { error } = await admin.from("codes").upsert(
      {
        code: qr.code.toUpperCase(),
        target_type: qr.targetType,
        target_id: targetId,
        active: qr.active,
      },
      { onConflict: "code" }
    );
    if (error) result.errors.push(`codes/${qr.code}: ${error.message}`);
    else result.codes++;
  }

  for (const match of SEED_LIVE_MATCHES) {
    const { error } = await admin.from("live_matches").upsert(
      {
        id: match.id,
        day: match.day,
        start_time: match.startTime,
        label_nl: match.label.nl,
        label_en: match.label.en,
        team_a: match.teamA,
        team_b: match.teamB,
        final_score: match.finalScore,
      },
      { onConflict: "id", ignoreDuplicates: true }
    );
    if (error) result.errors.push(`live_matches/${match.id}: ${error.message}`);
    else result.liveMatches++;
  }

  result.ok = result.errors.length === 0;
  if (result.ok) seeded = true;
  return result;
}

function defaultWheelStock(id: string): number {
  switch (id) {
    case "wp-water":
      return 200;
    case "wp-snack":
      return 100;
    case "wp-merch-10":
      return 50;
    case "wp-sticker":
      return 80;
    case "wp-food":
      return 25;
    default:
      return 0;
  }
}

/** Load reward stock from Supabase into in-memory store when needed for display. */
export async function syncRewardStockFromDb(): Promise<Map<string, number>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return new Map();

  const { data } = await supabase.from("rewards").select("slug, stock");
  return new Map((data ?? []).map((r) => [r.slug as string, r.stock as number]));
}

export async function syncWheelStockFromDb(): Promise<Map<string, number>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return new Map();

  const { data } = await supabase.from("wheel_prizes").select("id, stock, unlimited");
  return new Map(
    (data ?? []).map((r) => [
      r.id as string,
      r.unlimited ? 9999 : (r.stock as number),
    ])
  );
}
