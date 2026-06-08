import { cookies } from "next/headers";
import { Suspense } from "react";
import { ScheduleTimeline } from "@/app/schedule/schedule-timeline";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listScheduleItems, listScheduleSessions } from "@/lib/data/store";

export default async function SchedulePage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const sessions = listScheduleSessions();
  const items = listScheduleItems();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3X3 UNITES // schedule</div>
      <h1 className="font-display text-5xl sm:text-6xl uppercase">{t.schedule.title}</h1>
      <p className="mt-3 text-white/70 max-w-2xl">{t.schedule.subtitle}</p>

      <div className="mt-4 inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3 py-2">
        <span className="font-mono text-[11px] uppercase tracking-widest text-brand-green">
          FIBA 3x3 World Tour Masters & Women&apos;s Series
        </span>
      </div>

      <Suspense fallback={<div className="mt-10 text-white/45 font-mono text-sm">Loading schedule…</div>}>
        <ScheduleTimeline locale={locale} dict={t} sessions={sessions} items={items} />
      </Suspense>
    </div>
  );
}
