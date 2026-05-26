import { NextResponse } from "next/server";
import {
  pickWheelPrize,
  recordWheelSpin,
  wheelSpinsAvailable,
  wheelSpinsEarned,
} from "@/lib/data/store";
import { getCurrentUser } from "@/lib/session";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "not_logged_in" }, { status: 401 });
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
