import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { lookupPrizeCodeDb } from "@/lib/supabase/redemptions";

export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "not_admin" }, { status: 403 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ ok: false, error: "query_too_short" });
  }

  const result = await lookupPrizeCodeDb(q);
  if (!result) {
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
  return NextResponse.json(result);
}
