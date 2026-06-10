import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  markRewardRedeemedDb,
  markWheelRedeemedDb,
} from "@/lib/supabase/redemptions";

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "not_admin" }, { status: 403 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const body = (await req.json()) as { kind?: string; code?: string };
  const kind = body.kind;
  const code = body.code?.trim() ?? "";

  if (!code) {
    return NextResponse.json({ ok: false, error: "missing_code" });
  }

  if (kind === "reward") {
    const result = await markRewardRedeemedDb(code);
    if (!result) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json(result);
  }

  if (kind === "wheel") {
    const result = await markWheelRedeemedDb(code);
    if (!result) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json(result);
  }

  return NextResponse.json({ ok: false, error: "invalid_kind" });
}
