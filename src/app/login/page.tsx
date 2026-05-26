import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listDemoLoginOptions } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LoginTabs } from "./login-tabs";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const supabaseEnabled = isSupabaseConfigured();
  const options = listDemoLoginOptions();
  const params = (await searchParams) ?? {};
  const initialTab = params.tab === "register" ? "register" : "existing";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="brand-section-label mb-3">3x3 unites // login</div>
      <h1 className="font-display text-4xl sm:text-5xl">{t.login.title}</h1>
      <p className="mt-3 text-white/70">
        {supabaseEnabled ? t.login.subtitleAuth : t.login.subtitle}
      </p>

      <div className="mt-8">
        <LoginTabs
          supabaseEnabled={supabaseEnabled}
          options={options}
          tabExistingLabel={t.login.tabLogin}
          tabRegisterLabel={t.login.tabRegister}
          registerTitle={t.login.registerTitle}
          registerSubtitle={t.login.registerSubtitle}
          demoHint={t.login.demoHint}
          loginLabels={{
            emailLabel: t.login.emailLabel,
            emailPlaceholder: t.login.emailPlaceholder,
            passwordLabel: t.login.passwordLabel,
            passwordPlaceholder: t.login.passwordPlaceholder,
            submit: t.login.signInSubmit,
            submitting: t.login.signInSubmitting,
            errorInvalidCredentials: t.login.errorInvalidCredentials,
            errorEmailNotConfirmed: t.login.errorEmailNotConfirmed,
            errorAuthFailed: t.login.errorAuthFailed,
          }}
          registerLabels={{
            nameLabel: t.login.nameLabel,
            namePlaceholder: t.login.namePlaceholder,
            emailLabel: t.login.emailLabel,
            emailPlaceholder: t.login.emailPlaceholder,
            passwordLabel: t.login.passwordLabel,
            passwordPlaceholder: t.login.passwordPlaceholder,
            submit: t.login.submit,
            submitting: t.login.submitting,
            errorNameShort: t.login.errorNameShort,
            errorNameLong: t.login.errorNameLong,
            errorEmail: t.login.errorEmail,
            errorEmailExists: t.login.errorEmailExists,
            errorPasswordWeak: t.login.errorPasswordWeak,
            errorAuthFailed: t.login.errorAuthFailed,
            successConfirmEmail: t.login.successConfirmEmail,
            hint: t.login.hint,
          }}
          initialTab={initialTab}
        />
      </div>
    </div>
  );
}
