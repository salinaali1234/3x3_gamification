import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { ensureCatalogSeeded } from "@/lib/supabase/seed-catalog";

/** One-time catalog seed (journey steps, challenges, codes, rewards, wheel prizes). */
export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "not_authorized" }, { status: 403 });
  }

  const seeded = await ensureCatalogSeeded();
  if (!seeded) {
    return NextResponse.json(
      {
        ok: false,
        error: "seed_failed",
        hint: "Set SUPABASE_SERVICE_ROLE_KEY in .env.local and try again.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
