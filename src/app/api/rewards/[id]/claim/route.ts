import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { addRewardClaim, challengePoints, getRewardById, matchScorePoints, userClaims } from "@/lib/data/store";
import { generateVoucherCode } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { claimRewardDb } from "@/lib/supabase/game";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "not_logged_in" }, { status: 401 });
  }
  const reward = getRewardById(id);
  if (!reward) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (isSupabaseConfigured()) {
    const code = generateVoucherCode();
    const result = await claimRewardDb(reward.id, code);
    if (!result) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error });
    }
    return NextResponse.json({ ok: true, code: result.code });
  }

  if (reward.stock <= 0) {
    return NextResponse.json({ ok: false, error: "out_of_stock" });
  }
  if (userClaims(user.id).some((c) => c.rewardId === reward.id)) {
    return NextResponse.json({ ok: false, error: "already_claimed" });
  }
  const points = challengePoints(user.id) + matchScorePoints(user.id);
  if (points < reward.costPoints) {
    return NextResponse.json({ ok: false, error: "not_enough_points" });
  }
  const code = generateVoucherCode();
  addRewardClaim({
    id: `claim-${user.id}-${reward.id}-${Date.now()}`,
    userId: user.id,
    rewardId: reward.id,
    claimedAt: new Date().toISOString(),
    voucherCode: code,
  });
  return NextResponse.json({ ok: true, code });
}
