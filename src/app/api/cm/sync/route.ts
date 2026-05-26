import { NextResponse } from "next/server";
import { syncParticipantsFromCm } from "@/lib/cm/sync";
import { testCmConnection } from "@/lib/cm/client";
import { isCmConfigured } from "@/lib/cm/env";
import { requireAdmin } from "@/lib/session";

/**
 * POST — pull ticket orders from CM and register participants.
 * GET — test CM API connection (admin only).
 */
export async function POST(req: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authHeader = req.headers.get("authorization");
  const isCron =
    cronSecret &&
    authHeader === `Bearer ${cronSecret}`;

  if (!isCron) {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
  }

  if (!isCmConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "cm_not_configured",
        hint: "Set CM_API_TOKEN and CM_EVENT_UUID in .env.local",
      },
      { status: 503 }
    );
  }

  try {
    const result = await syncParticipantsFromCm();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "sync_failed",
      },
      { status: 502 }
    );
  }
}

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  if (!isCmConfigured()) {
    return NextResponse.json({
      ok: false,
      configured: false,
      message: "CM_API_TOKEN or CM_EVENT_UUID missing",
    });
  }

  const test = await testCmConnection();
  return NextResponse.json({ configured: true, ...test });
}
