import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listDemoLoginOptions } from "@/lib/session";
import { LoginList } from "./login-list";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const options = listDemoLoginOptions();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="brand-section-label mb-3">3x3 unites // login</div>
      <h1 className="font-display text-5xl">{t.login.title}</h1>
      <p className="mt-3 text-white/70">{t.login.subtitle}</p>
      <p className="mt-1 text-sm text-white/50">{t.login.asNew}</p>

      <div className="mt-8">
        <LoginList options={options} />
      </div>
    </div>
  );
}
