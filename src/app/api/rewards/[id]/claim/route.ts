import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import {
  addRewardClaim,
  getRewardById,
  totalPoints,
  userClaims,
} from "@/lib/data/store";
import { generateVoucherCode } from "@/lib/utils";

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
  if (reward.stock <= 0) {
    return NextResponse.json({ ok: false, error: "out_of_stock" });
  }
  if (userClaims(user.id).some((c) => c.rewardId === reward.id)) {
    return NextResponse.json({ ok: false, error: "already_claimed" });
  }
  const points = totalPoints(user.id);
  // For mockup: claims subtract from a "spent" pool tracked separately; for simplicity
  // we treat claiming as a record only (points unchanged) but still enforce affordability.
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
