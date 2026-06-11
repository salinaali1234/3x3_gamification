import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);

  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

  if (!user) {
    redirect("/login/forgot-password?error=session");
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="brand-section-label mb-3">3X3 UNITES // FESTIVAL</div>
      <h1 className="font-display text-4xl sm:text-5xl">{t.login.resetPasswordTitle}</h1>
      <p className="mt-3 text-white/70">{t.login.resetPasswordSubtitle}</p>

      <div className="mt-8 rounded-md border border-brand-green/30 bg-brand-green/5 p-6 sm:p-8">
        <ResetPasswordForm
          labels={{
            passwordLabel: t.login.newPasswordLabel,
            passwordPlaceholder: t.login.passwordPlaceholder,
            confirmPasswordLabel: t.login.confirmPasswordLabel,
            showPassword: t.login.showPassword,
            hidePassword: t.login.hidePassword,
            submit: t.login.resetPasswordSubmit,
            submitting: t.login.resetPasswordSubmitting,
            errorPasswordWeak: t.login.errorPasswordWeak,
            errorPasswordMismatch: t.login.errorPasswordMismatch,
            errorSessionExpired: t.login.errorSessionExpired,
            errorAuthFailed: t.login.errorAuthFailed,
          }}
        />

        <p className="mt-6 text-sm">
          <Link
            href="/login"
            className="font-mono text-xs uppercase tracking-wider text-brand-green hover:underline"
          >
            {t.login.backToLogin}
          </Link>
        </p>
      </div>
    </div>
  );
}
