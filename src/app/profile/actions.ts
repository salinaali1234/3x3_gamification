"use server";

import { revalidatePath } from "next/cache";
import { updateProfile } from "@/lib/data/store";
import { requireUser } from "@/lib/session";

export async function updateProfileAction(userId: string, displayName: string) {
  const user = await requireUser();
  if (user.id !== userId) throw new Error("Forbidden");
  const trimmed = displayName.trim();
  if (!trimmed) return;
  updateProfile(userId, { displayName: trimmed });
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
}
