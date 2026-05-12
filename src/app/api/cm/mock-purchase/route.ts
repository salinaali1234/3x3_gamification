import { NextResponse } from "next/server";
import { z } from "zod";
import { addProfile, getProfileByEmail, listProfiles } from "@/lib/data/store";
import { requireAdmin } from "@/lib/session";

const Body = z.object({
  name: z.string().min(1).max(60),
  email: z.string().email(),
});

const AVATAR_COLORS = ["#BEFF00", "#FF6701", "#00FFFF", "#F3EEE4", "#9B5DE5", "#FF477E"];

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  }
  const existing = getProfileByEmail(parsed.data.email);
  if (existing) {
    return NextResponse.json({
      ok: true,
      userId: existing.id,
      displayName: existing.displayName,
      existed: true,
    });
  }
  const all = listProfiles();
  const newId = `user-${all.length + 1}-${Date.now()}`;
  const color = AVATAR_COLORS[all.length % AVATAR_COLORS.length];
  addProfile({
    id: newId,
    cmTicketId: `CM-${200000 + all.length}`,
    displayName: parsed.data.name,
    email: parsed.data.email,
    avatarColor: color,
    role: "participant",
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({
    ok: true,
    userId: newId,
    displayName: parsed.data.name,
    existed: false,
  });
}
