import { NextResponse } from "next/server";
import { z } from "zod";
import { submitMatchScore } from "@/lib/data/store";
import { getCurrentUser } from "@/lib/session";

const Body = z.object({ score: z.string().min(1) });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "not_logged_in" }, { status: 401 });
  }
  const { id } = await params;
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "bad_input" }, { status: 400 });
  }
  const result = submitMatchScore(user.id, id, parsed.data.score);
  if (!result.ok) {
    return NextResponse.json(result);
  }
  return NextResponse.json(result);
}
