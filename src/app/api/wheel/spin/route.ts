import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { spinWheelDb } from "@/lib/supabase/game";
import {
  pickWheelPrize,
  recordWheelSpin,
  wheelSpinsAvailable,
  wheelSpinsEarned,
} from "@/lib/data/store";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";

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
    const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
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
      pickupCode: result.pickup_code as string | undefined,
      spinsRemaining: result.spins_remaining,
      spinsEarned: result.spins_earned,
    });
  }

  if (wheelSpinsAvailable(user.id) < 1) {
    return NextResponse.json({ ok: false, error: "no_spins" });
  }

  const prize = pickWheelPrize();
  const spin = recordWheelSpin(user.id, prize.id);

  return NextResponse.json({
    ok: true,
    prize: { id: prize.id, label: prize.label, emoji: prize.emoji },
    pickupCode: spin.pickupCode,
    spinsRemaining: wheelSpinsAvailable(user.id),
    spinsEarned: wheelSpinsEarned(user.id),
  });
}
