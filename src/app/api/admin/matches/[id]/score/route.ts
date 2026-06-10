import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { setLiveMatchFinalScoreDb } from "@/lib/supabase/live-matches";

const Body = z.object({
  finalScore: z.string(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "not_authorized" }, { status: 403 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "supabase_not_configured" }, { status: 503 });
  }

  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  }

  const result = await setLiveMatchFinalScoreDb(id, parsed.data.finalScore);
  if (!result.ok) {
    return NextResponse.json(result, { status: result.error === "not_found" ? 404 : 400 });
  }

  return NextResponse.json(result);
}
