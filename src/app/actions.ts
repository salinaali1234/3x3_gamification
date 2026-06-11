"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { clearCurrentUser, setCurrentUser } from "@/lib/session";
import {
  addProfile,
  getProfileByEmail,
  listProfiles,
} from "@/lib/data/store";
import type { Profile } from "@/lib/data/types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapAuthError } from "@/lib/auth/errors";
import { getSiteUrl } from "@/lib/site-url";
import { ensureUserProfileForUser } from "@/lib/supabase/ensure-profile";

const GUEST_AVATAR_COLORS = [
  "#BEFF00",
  "#FF6701",
  "#00FFFF",
  "#F3EEE4",
  "#9B5DE5",
  "#FF477E",
  "#06D6A0",
  "#FFD60A",
];

export async function setLocaleAction(locale: Locale) {
  const store = await cookies();
  store.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}

/** Demo-only login when Supabase env is not set */
export async function loginAsAction(userId: string) {
  if (isSupabaseConfigured()) {
    throw new Error("Demo login is disabled when Supabase is configured");
  }
  await setCurrentUser(userId);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }
  await clearCurrentUser();
  revalidatePath("/", "layout");
  redirect("/");
}

export type AuthFormState = {
  ok: boolean;
  error?: string;
  needsConfirmation?: boolean;
};

function parseEmailPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

export async function signInAction(
  _prev: AuthFormState | undefined,
  formData: FormData
): Promise<AuthFormState> {
  const { email, password } = parseEmailPassword(formData);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "invalid_email" };
  }
  if (password.length < 8) {
    return { ok: false, error: "password_weak" };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, error: "not_configured" };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "not_configured" };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { ok: false, error: mapAuthError(error.message) };
  }

  if (data.user) {
    await ensureUserProfileForUser(supabase, data.user);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export type ForgotPasswordState = {
  ok: boolean;
  error?: string;
};

export async function requestPasswordResetAction(
  _prev: ForgotPasswordState | undefined,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "invalid_email" };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, error: "not_configured" };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "not_configured" };
  }

  const siteUrl = await getSiteUrl();
  const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent("/login/reset-password")}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    const mapped = mapAuthError(error.message);
    // Supabase may rate-limit while an earlier reset email was already sent.
    if (mapped === "rate_limit") {
      return { ok: true };
    }
    return { ok: false, error: mapped };
  }

  return { ok: true };
}

export type ResetPasswordState = {
  ok: boolean;
  error?: string;
};

export async function resetPasswordAction(
  _prev: ResetPasswordState | undefined,
  formData: FormData
): Promise<ResetPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    return { ok: false, error: "password_weak" };
  }
  if (password !== confirmPassword) {
    return { ok: false, error: "password_mismatch" };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, error: "not_configured" };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "not_configured" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "session_expired" };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { ok: false, error: mapAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export type RegisterState = AuthFormState;

export async function registerAction(
  _prev: RegisterState | undefined,
  formData: FormData
): Promise<RegisterState> {
  const rawName = String(formData.get("displayName") ?? "").trim();
  const rawEmail = String(formData.get("email") ?? "").trim().toLowerCase();
  const rawPassword = String(formData.get("password") ?? "");
  const dataConsent = formData.get("dataConsent") === "yes";

  if (rawName.length < 2) {
    return { ok: false, error: "name_too_short" };
  }
  if (rawName.length > 40) {
    return { ok: false, error: "name_too_long" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    return { ok: false, error: "invalid_email" };
  }
  if (rawPassword.length < 8) {
    return { ok: false, error: "password_weak" };
  }
  if (!dataConsent) {
    return { ok: false, error: "consent_required" };
  }

  const consentAt = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return { ok: false, error: "not_configured" };
    }

    const { data, error } = await supabase.auth.signUp({
      email: rawEmail,
      password: rawPassword,
      options: {
        data: {
          display_name: rawName,
          data_consent: true,
          data_consent_at: consentAt,
        },
      },
    });

    if (error) {
      return { ok: false, error: mapAuthError(error.message) };
    }

    if (data.session?.user) {
      await ensureUserProfileForUser(supabase, data.session.user);
      revalidatePath("/", "layout");
      redirect("/dashboard");
    }

    if (data.user) {
      await ensureUserProfileForUser(supabase, data.user);
    }

    return { ok: true, needsConfirmation: true };
  }

  // Mock mode (no Supabase)
  if (getProfileByEmail(rawEmail)) {
    return { ok: false, error: "email_exists" };
  }

  const all = listProfiles();
  const id = `guest-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
  const profile: Profile = {
    id,
    cmTicketId: null,
    displayName: rawName,
    email: rawEmail,
    avatarColor:
      GUEST_AVATAR_COLORS[all.length % GUEST_AVATAR_COLORS.length],
    role: "participant",
    createdAt: new Date().toISOString(),
  };

  addProfile(profile);
  await setCurrentUser(id);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
