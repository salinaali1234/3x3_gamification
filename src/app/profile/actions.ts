"use server";

import { revalidatePath } from "next/cache";
import { mapAuthError } from "@/lib/auth/errors";
import { updateProfile } from "@/lib/data/store";
import { getCurrentUser, requireUser } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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

export type ChangePasswordState = {
  ok: boolean;
  error?: string;
};

export async function changePasswordAction(
  _prev: ChangePasswordState | undefined,
  formData: FormData
): Promise<ChangePasswordState> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "not_logged_in" };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, error: "not_configured" };
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 8) {
    return { ok: false, error: "password_weak" };
  }
  if (newPassword !== confirmPassword) {
    return { ok: false, error: "password_mismatch" };
  }
  if (currentPassword === newPassword) {
    return { ok: false, error: "password_same" };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "not_configured" };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return { ok: false, error: "wrong_current_password" };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { ok: false, error: mapAuthError(error.message) };
  }

  return { ok: true };
}
