import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { addRewardClaim, getRewardById, userClaims } from "@/lib/data/store";
import { generateVoucherCode } from "@/lib/utils";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { claimRewardDb } from "@/lib/supabase/game";
import { syncMemCompletionsToDb } from "@/lib/supabase/challenges-v2";
import { getUserPointsBalance } from "@/lib/data/user-game";

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
    await syncMemCompletionsToDb(user.id);
    const balance = await getUserPointsBalance(user.id);
    if (balance < reward.costPoints) {
      return NextResponse.json({
        ok: false,
        error: "not_enough_points",
        balance,
        required: reward.costPoints,
      });
    }

    const result = await claimRewardDb(reward.id);
    if (!result) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error });
    }
    const stockRemaining =
      typeof result.stock_remaining === "number" ? result.stock_remaining : undefined;
    revalidatePath("/rewards");
    revalidatePath("/profile");
    return NextResponse.json({
      ok: true,
      code: result.code,
      stockRemaining,
    });
  }

  if (reward.stock <= 0) {
    return NextResponse.json({ ok: false, error: "out_of_stock" });
  }
  if (userClaims(user.id).some((c) => c.rewardId === reward.id)) {
    return NextResponse.json({ ok: false, error: "already_claimed" });
  }
  const points = await getUserPointsBalance(user.id);
  if (points < reward.costPoints) {
    return NextResponse.json({
      ok: false,
      error: "not_enough_points",
      balance: points,
      required: reward.costPoints,
    });
  }
  const code = generateVoucherCode();
  addRewardClaim({
    id: `claim-${user.id}-${reward.id}-${Date.now()}`,
    userId: user.id,
    rewardId: reward.id,
    claimedAt: new Date().toISOString(),
    voucherCode: code,
  });
  const updated = getRewardById(reward.id);
  revalidatePath("/rewards");
  revalidatePath("/profile");
  return NextResponse.json({
    ok: true,
    code,
    stockRemaining: updated?.stock ?? 0,
  });
}
