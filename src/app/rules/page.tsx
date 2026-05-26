import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function RulesPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3x3 unites // rules</div>
      <h1 className="font-display text-5xl">{t.rules.title}</h1>
      <p className="mt-3 text-white/70">{t.rules.subtitle}</p>

      <div className="mt-10 space-y-8">
        {t.rules.sections.map((section, i) => (
          <section
            key={i}
            className="rounded-md border border-white/10 bg-white/[0.02] p-6"
          >
            <h2 className="font-display text-2xl text-brand-orange mb-4">
              {section.title}
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-white/70">
              {section.bullets.map((bullet, j) => (
                <li key={j}>{bullet}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
