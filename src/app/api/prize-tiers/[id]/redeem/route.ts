import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { redeemTier } from "@/lib/data/challenges-v2";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "not_logged_in" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const result = redeemTier(user.id, id);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    voucherCode: result.voucherCode,
    cost: result.cost,
    balance: result.balance,
  });
}
