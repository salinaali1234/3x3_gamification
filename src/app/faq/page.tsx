import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function FaqPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3x3 unites // faq</div>
      <h1 className="font-display text-5xl">{t.faq.title}</h1>
      <p className="mt-3 text-white/70">{t.faq.subtitle}</p>

      <dl className="mt-10 space-y-6">
        {t.faq.items.map((item, i) => (
          <div
            key={i}
            className="rounded-md border border-white/10 bg-white/[0.02] p-5"
          >
            <dt className="font-display text-xl text-brand-green">{item.q}</dt>
            <dd className="mt-2 text-sm text-white/70 leading-relaxed">{item.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
