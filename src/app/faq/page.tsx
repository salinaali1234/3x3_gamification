import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function FaqPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3X3 UNITES // faq & rules</div>
      <h1 className="font-display text-5xl">{t.faq.title}</h1>
      <p className="mt-3 text-white/70">{t.faq.subtitle}</p>

      <nav className="mt-6 flex flex-col sm:flex-row flex-wrap gap-2 text-sm font-mono uppercase tracking-wider">
        <a
          href="#faq"
          className="inline-flex min-h-11 items-center justify-center rounded border border-brand-green/40 bg-brand-green/10 px-4 py-2 text-brand-green"
        >
          FAQ
        </a>
        <a
          href="#rules"
          className="inline-flex min-h-11 items-center justify-center rounded border border-white/15 px-4 py-2 text-white/70 hover:border-brand-orange/40 hover:text-brand-orange"
        >
          {t.nav.rules}
        </a>
      </nav>

      <dl id="faq" className="mt-10 scroll-mt-24 space-y-6">
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

      <section id="rules" className="mt-16 scroll-mt-24 border-t border-white/10 pt-12">
        <h2 className="font-display text-4xl">{t.rules.title}</h2>
        <p className="mt-3 text-white/70">{t.rules.subtitle}</p>

        <div className="mt-10 space-y-8">
          {t.rules.sections.map((section, i) => (
            <div
              key={i}
              className="rounded-md border border-white/10 bg-white/[0.02] p-6"
            >
              <h3 className="font-display text-2xl text-brand-orange mb-4">
                {section.title}
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-white/70">
                {section.bullets.map((bullet, j) => (
                  <li key={j}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
