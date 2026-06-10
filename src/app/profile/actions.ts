"use server";

import { revalidatePath } from "next/cache";
import { updateProfile } from "@/lib/data/store";
import { requireUser } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { updateDisplayNameDb } from "@/lib/supabase/profiles";

export async function updateProfileAction(
  userId: string,
  displayName: string
): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  if (user.id !== userId) throw new Error("Forbidden");

  const trimmed = displayName.trim();
  if (!trimmed) return { ok: false, error: "empty" };
  if (trimmed.length < 2) return { ok: false, error: "name_too_short" };
  if (trimmed.length > 40) return { ok: false, error: "name_too_long" };

  if (isSupabaseConfigured()) {
    const result = await updateDisplayNameDb(userId, trimmed);
    if (!result.ok) return { ok: false, error: result.error };
  } else {
    updateProfile(userId, { displayName: trimmed });
  }

  revalidatePath("/", "layout");
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  return { ok: true };
}
