import { createSupabaseServiceRoleClient } from "./admin";
import { isSupabaseConfigured } from "./env";
import { createSupabaseServerClient } from "./server";
import {
  SEED_CHALLENGES,
  SEED_JOURNEY_STEPS,
  SEED_REWARDS,
  SEED_WHEEL_PRIZES,
  buildSeedQrCodes,
} from "@/lib/data/seed";

let seeded = false;

/** Idempotent catalog seed into Supabase (requires service role key). */
export async function ensureCatalogSeeded(): Promise<boolean> {
  if (!isSupabaseConfigured() || seeded) return seeded;

  const admin = createSupabaseServiceRoleClient();
  if (!admin) return false;

  const { count } = await admin
    .from("journey_steps")
    .select("*", { count: "exact", head: true });
  if ((count ?? 0) > 0) {
    seeded = true;
    return true;
  }

  for (const step of SEED_JOURNEY_STEPS) {
    const { error } = await admin.from("journey_steps").insert({
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
    });
    if (error) {
      console.error("[seed] journey_steps", step.id, error.message);
      return false;
    }
  }

  for (const ch of SEED_CHALLENGES) {
    const { error } = await admin.from("challenges").insert({
      slug: ch.id,
      type: ch.type,
      title_nl: ch.title.nl,
      title_en: ch.title.en,
      description_nl: ch.description.nl,
      description_en: ch.description.en,
      points: ch.points,
      accent: ch.accent,
      payload: ch.payload,
    });
    if (error) {
      console.error("[seed] challenges", ch.id, error.message);
      return false;
    }
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
    if (!targetId) continue;
    const { error } = await admin.from("codes").upsert({
      code: qr.code.toUpperCase(),
      target_type: qr.targetType,
      target_id: targetId,
      active: qr.active,
    });
    if (error) {
      console.error("[seed] codes", qr.code, error.message);
    }
  }

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
    if (error) {
      console.error("[seed] rewards", rw.id, error.message);
      return false;
    }
  }

  for (const wp of SEED_WHEEL_PRIZES) {
    const { error } = await admin.from("wheel_prizes").upsert({
      id: wp.id,
      label_nl: wp.label.nl,
      label_en: wp.label.en,
      emoji: wp.emoji,
      weight: wp.weight,
      stock: wp.id === "wp-spin-again" ? 0 : defaultWheelStock(wp.id),
      unlimited: wp.id === "wp-spin-again",
    });
    if (error) {
      console.error("[seed] wheel_prizes", wp.id, error.message);
      return false;
    }
  }

  seeded = true;
  return true;
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
