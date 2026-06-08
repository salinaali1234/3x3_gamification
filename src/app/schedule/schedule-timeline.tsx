"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { getDictionary } from "@/lib/i18n/dictionaries";
import {
  buildSessionDayMap,
  getNowPlayingItemIdFromSessions,
  parseSchedulePreview,
} from "@/lib/schedule/now-playing";
import type { FestivalDay, ScheduleItemKind } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const DAYS: FestivalDay[] = ["friday", "saturday", "sunday"];

const KIND_STYLE: Record<ScheduleItemKind, string> = {
  doors: "border-white/15 bg-white/[0.03] text-white/70",
  match: "border-brand-green/35 bg-brand-green/[0.06] text-brand-green",
  show: "border-brand-blue/35 bg-brand-blue/[0.06] text-brand-blue",
  break: "border-white/10 bg-white/[0.02] text-white/45",
  ceremony: "border-brand-orange/35 bg-brand-orange/[0.06] text-brand-orange",
  end: "border-white/10 bg-transparent text-white/35",
};

type Session = {
  id: string;
  day: FestivalDay;
  title: { nl: string; en: string };
  location: { nl: string; en: string };
  tagline?: { nl: string; en: string };
};

type Item = {
  id: string;
  sessionId: string;
  startTime: string;
  title: { nl: string; en: string };
  kind: ScheduleItemKind;
  court?: string;
};

export function ScheduleTimeline({
  locale,
  dict,
  sessions,
  items,
}: {
  locale: "nl" | "en";
  dict: ReturnType<typeof getDictionary>;
  sessions: Session[];
  items: Item[];
}) {
  const searchParams = useSearchParams();
  const preview = useMemo(
    () => parseSchedulePreview(searchParams.get("preview")),
    [searchParams]
  );
  const [now, setNow] = useState(() => new Date());
  const sessionDay = useMemo(() => buildSessionDayMap(sessions), [sessions]);

  useEffect(() => {
    if (preview) return;
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [preview]);

  const nowPlayingId = getNowPlayingItemIdFromSessions(items, sessionDay, now, "Europe/Amsterdam", preview);

  return (
    <>
      {preview ? (
        <div className="mt-6 rounded border border-brand-orange/40 bg-brand-orange/10 px-4 py-3 text-sm text-brand-orange">
          <p>
            {dict.schedule.previewActive
              .replace("{day}", dict.schedule.days[preview.day])
              .replace("{time}", preview.timeLabel)}
          </p>
          <p className="mt-1 text-xs text-brand-orange/80">{dict.schedule.previewHint}</p>
          <Link
            href="/schedule"
            className="mt-2 inline-block font-mono text-[11px] uppercase tracking-wider underline underline-offset-2"
          >
            {dict.schedule.previewExit}
          </Link>
        </div>
      ) : null}

      <div className="mt-10 space-y-12">
      {DAYS.map((day) => {
        const daySessions = sessions.filter((s) => s.day === day);
        if (daySessions.length === 0) return null;

        return (
          <section key={day}>
            <h2 className="font-display text-4xl uppercase mb-6 border-b border-white/10 pb-3">
              {dict.schedule.days[day]}
            </h2>

            <div className="space-y-8">
              {daySessions.map((session) => {
                const sessionItems = items
                  .filter((item) => item.sessionId === session.id)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));

                return (
                  <div key={session.id} className="border border-white/10 bg-brand-black">
                    <div className="border-b border-white/10 bg-white/[0.03] px-4 py-4 sm:px-5">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-display text-2xl sm:text-3xl uppercase">
                          {session.title[locale]}
                        </h3>
                        <span className="font-mono text-[11px] uppercase tracking-widest text-white/45">
                          {session.location[locale]}
                        </span>
                      </div>
                      {session.tagline ? (
                        <p className="mt-2 text-sm text-brand-orange/90 leading-relaxed">
                          {session.tagline[locale]}
                        </p>
                      ) : null}
                    </div>

                    <ul className="divide-y divide-white/8">
                      {sessionItems.map((item) => (
                        <ScheduleRow
                          key={item.id}
                          item={item}
                          locale={locale}
                          dict={dict}
                          isLive={item.id === nowPlayingId}
                        />
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
      </div>
    </>
  );
}

function ScheduleRow({
  item,
  locale,
  dict,
  isLive,
}: {
  item: Item;
  locale: "nl" | "en";
  dict: ReturnType<typeof getDictionary>;
  isLive: boolean;
}) {
  const kindLabel = dict.schedule.kinds[item.kind];
  const isEnd = item.kind === "end";

  return (
    <li
      className={cn(
        "flex gap-4 px-4 py-3 sm:px-5 sm:py-3.5 transition-colors duration-300",
        isLive ? "items-center" : "items-start",
        isEnd && !isLive && "bg-white/[0.02]",
        isLive &&
          "border-l-[3px] border-l-brand-orange bg-brand-orange/[0.12] shadow-[inset_0_0_0_1px_rgba(255,103,1,0.25)]"
      )}
    >
      <time
        dateTime={item.startTime}
        className={cn(
          "shrink-0 w-[3.25rem] pt-0.5 font-mono text-sm tabular-nums",
          isLive ? "font-bold text-brand-orange" : "text-white/55"
        )}
      >
        {item.startTime}
      </time>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={cn(
              "leading-snug",
              isLive && "font-bold text-brand-orange",
              !isLive && isEnd && "font-medium text-white/45 italic",
              !isLive && !isEnd && "font-medium text-white"
            )}
          >
            {item.title[locale]}
          </span>
          {item.court ? (
            <span
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                isLive ? "bg-brand-orange/20 text-brand-orange" : "bg-white/10 text-white/50"
              )}
            >
              {item.court}
            </span>
          ) : null}
        </div>
      </div>

      {isLive ? (
        <span className="shrink-0 inline-flex items-center gap-1.5 self-center rounded-full border border-brand-orange/60 bg-brand-orange px-3 py-1.5 font-mono text-xs font-bold uppercase leading-none text-brand-black shadow-[0_0_12px_rgba(255,103,1,0.35)]">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-black/40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-black" />
          </span>
          {dict.schedule.liveNow}
        </span>
      ) : (
        <span
          className={cn(
            "shrink-0 hidden sm:inline-flex self-center rounded border px-2 py-1 font-mono text-[10px] uppercase tracking-wider leading-none",
            KIND_STYLE[item.kind]
          )}
        >
          {kindLabel}
        </span>
      )}
    </li>
  );
}
