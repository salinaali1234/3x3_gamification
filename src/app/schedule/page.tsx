import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listLiveMatches, listSideEvents } from "@/lib/data/store";
import type { FestivalDay } from "@/lib/data/types";

const DAYS: FestivalDay[] = ["friday", "saturday", "sunday"];

const KIND_BG: Record<string, string> = {
  activation: "bg-brand-orange/10 border-brand-orange/40 text-brand-orange",
  match: "bg-brand-green/10 border-brand-green/40 text-brand-green",
  show: "bg-brand-blue/10 border-brand-blue/40 text-brand-blue",
  meet: "bg-purple-500/10 border-purple-400/40 text-purple-300",
};

export default async function SchedulePage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const events = listSideEvents();
  const matches = listLiveMatches();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3x3 unites // schedule</div>
      <h1 className="font-display text-5xl">{t.schedule.title}</h1>
      <p className="mt-3 text-white/70 max-w-2xl">{t.schedule.subtitle}</p>

      <div className="mt-8 space-y-10">
        {DAYS.map((day) => {
          const dayEvents = events.filter((e) => e.day === day);
          const dayMatches = matches.filter((m) => m.day === day);
          if (dayEvents.length === 0 && dayMatches.length === 0) return null;
          return (
            <section key={day}>
              <h2 className="font-display text-3xl mb-4 capitalize">
                {t.schedule.days[day]}
              </h2>
              <ul className="space-y-3">
                {[...dayEvents]
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((e) => (
                    <li
                      key={e.id}
                      className={`rounded-md border p-4 ${
                        KIND_BG[e.kind] ?? "border-white/15"
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-mono text-xs uppercase tracking-wider">
                          {e.startTime}–{e.endTime}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">
                          {t.schedule.kinds[e.kind]}
                        </span>
                      </div>
                      <h3 className="mt-1 font-display text-xl text-white">
                        {e.title[locale]}
                        {e.host ? (
                          <span className="ml-2 text-sm text-white/60 font-mono">
                            — {e.host}
                          </span>
                        ) : null}
                      </h3>
                      <p className="text-sm text-white/70">{e.description[locale]}</p>
                      <p className="mt-1 text-xs text-white/50 font-mono">
                        📍 {e.location[locale]}
                      </p>
                    </li>
                  ))}
                {dayMatches.map((m) => (
                  <li
                    key={m.id}
                    className="rounded-md border border-white/15 bg-white/[0.02] p-4"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-mono text-xs uppercase tracking-wider text-white/60">
                        {m.startTime}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-brand-green">
                        {t.schedule.kinds.match}
                      </span>
                    </div>
                    <h3 className="mt-1 font-display text-xl">{m.label[locale]}</h3>
                    <p className="text-sm text-white/60">
                      {m.finalScore
                        ? `${t.schedule.finalScore}: ${m.finalScore}`
                        : t.schedule.upcoming}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
