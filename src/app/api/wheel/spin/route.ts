import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { spinWheelDb } from "@/lib/supabase/game";
import {
  pickWheelPrize,
  recordWheelSpin,
  wheelSpinsAvailable,
  wheelSpinsEarned,
} from "@/lib/data/store";
import type { Locale } from "@/lib/i18n/config";
import { cookies } from "next/headers";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "not_logged_in" }, { status: 401 });
  }

  if (isSupabaseConfigured()) {
    const result = await spinWheelDb();
    if (!result) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error });
    }
    const cookieStore = await cookies();
    const locale = (cookieStore.get("3x3_locale")?.value ?? "nl") as Locale;
    const prize = result.prize as {
      id: string;
      emoji: string;
      label_nl: string;
      label_en: string;
    };
    return NextResponse.json({
      ok: true,
      prize: {
        id: prize.id,
        label: locale === "nl" ? prize.label_nl : prize.label_en,
        emoji: prize.emoji,
      },
      spinsRemaining: result.spins_remaining,
      spinsEarned: result.spins_earned,
    });
  }

  if (wheelSpinsAvailable(user.id) < 1) {
    return NextResponse.json({ ok: false, error: "no_spins" });
  }

  const prize = pickWheelPrize();
  recordWheelSpin(user.id, prize.id);

  return NextResponse.json({
    ok: true,
    prize: { id: prize.id, label: prize.label, emoji: prize.emoji },
    spinsRemaining: wheelSpinsAvailable(user.id),
    spinsEarned: wheelSpinsEarned(user.id),
  });
}
