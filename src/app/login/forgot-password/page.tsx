import Link from "next/link";
import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ForgotPasswordForm } from "./forgot-password-form";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const supabaseEnabled = isSupabaseConfigured();
  const params = (await searchParams) ?? {};

  return (
    <div className="mx-auto w-full max-w-lg px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="brand-section-label mb-3">3X3 UNITES // FESTIVAL</div>
      <h1 className="font-display text-4xl sm:text-5xl">{t.login.forgotPasswordTitle}</h1>
      <p className="mt-3 text-white/70">{t.login.forgotPasswordSubtitle}</p>
      {params.error === "auth_callback" ? (
        <p
          role="alert"
          className="mt-4 rounded border border-brand-orange/40 bg-brand-orange/10 px-4 py-3 text-sm text-brand-orange"
        >
          {t.login.errorAuthCallback}
        </p>
      ) : null}

      <div className="mt-8 rounded-md border border-brand-green/30 bg-brand-green/5 p-6 sm:p-8">
        {supabaseEnabled ? (
          <ForgotPasswordForm
            callbackError={params.error}
            labels={{
              emailLabel: t.login.emailLabel,
              emailPlaceholder: t.login.emailPlaceholder,
              submit: t.login.forgotPasswordSubmit,
              submitting: t.login.forgotPasswordSubmitting,
              success: t.login.forgotPasswordSuccess,
              errorEmail: t.login.errorEmail,
              errorGeneric: t.login.forgotPasswordError,
              errorRedirectNotAllowed: t.login.forgotPasswordRedirectError,
              errorAuthCallback: t.login.errorAuthCallback,
              errorNotConfigured: t.login.errorNotConfigured,
            }}
          />
        ) : (
          <p className="text-sm text-white/60">{t.login.errorNotConfigured}</p>
        )}

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
