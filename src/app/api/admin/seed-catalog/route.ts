import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { ensureCatalogSeeded, seedCatalog } from "@/lib/supabase/seed-catalog";

/** One-time catalog seed (journey steps, challenges, codes, rewards, wheel prizes). */
export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "not_authorized" }, { status: 403 });
  }

  const result = await seedCatalog();
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "seed_failed",
        hint: "Set SUPABASE_SERVICE_ROLE_KEY in .env.local and try again.",
        details: result.errors,
        counts: {
          journeySteps: result.journeySteps,
          challenges: result.challenges,
          badges: result.badges,
          codes: result.codes,
          rewards: result.rewards,
          wheelPrizes: result.wheelPrizes,
          liveMatches: result.liveMatches,
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, counts: {
    journeySteps: result.journeySteps,
    challenges: result.challenges,
    badges: result.badges,
    codes: result.codes,
    rewards: result.rewards,
    wheelPrizes: result.wheelPrizes,
    liveMatches: result.liveMatches,
  }});
}
