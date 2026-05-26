import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { MapClient } from "./map-client";

export default async function MapPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3x3 unites // plattegrond</div>
      <h1 className="font-display text-5xl">{t.map.title}</h1>
      <p className="mt-3 text-white/70 max-w-2xl">{t.map.subtitle}</p>
      <MapClient locale={locale} dict={t} />
    </div>
  );
}
