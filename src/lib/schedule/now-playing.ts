import type { FestivalDay, ScheduleItem } from "@/lib/data/types";

/** Festival calendar dates (Europe/Amsterdam). */
export const FESTIVAL_DAY_DATES: Record<FestivalDay, string> = {
  friday: "2026-06-19",
  saturday: "2026-06-20",
  sunday: "2026-06-21",
};

const DAY_BY_DATE = Object.fromEntries(
  Object.entries(FESTIVAL_DAY_DATES).map(([day, date]) => [date, day as FestivalDay])
) as Record<string, FestivalDay>;

export function parseScheduleTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function getFestivalDayForDate(date: Date, timeZone = "Europe/Amsterdam"): FestivalDay | null {
  const dateKey = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  return DAY_BY_DATE[dateKey] ?? null;
}

export function getMinutesInTimeZone(date: Date, timeZone = "Europe/Amsterdam"): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export function buildSessionDayMap(
  sessions: { id: string; day: FestivalDay }[]
): Map<string, FestivalDay> {
  return new Map(sessions.map((s) => [s.id, s.day]));
}

export type SchedulePreview = {
  day: FestivalDay;
  minutes: number;
  timeLabel: string;
};

/** Parse `?preview=friday-18:00` style query values. */
export function parseSchedulePreview(raw: string | null | undefined): SchedulePreview | null {
  if (!raw?.trim()) return null;

  const match = raw.trim().match(/^(friday|saturday|sunday)-(\d{1,2}):(\d{2})$/i);
  if (!match) return null;

  const day = match[1].toLowerCase() as FestivalDay;
  const hour = Number(match[2]);
  const minute = Number(match[3]);
  if (hour > 23 || minute > 59) return null;

  const timeLabel = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return { day, minutes: hour * 60 + minute, timeLabel };
}

/** Returns the schedule row that is live right now on a festival day. */
export function getNowPlayingItemIdFromSessions(
  items: ScheduleItem[],
  sessionDay: Map<string, FestivalDay>,
  now: Date,
  timeZone = "Europe/Amsterdam",
  preview?: SchedulePreview | null
): string | null {
  const festivalDay = preview?.day ?? getFestivalDayForDate(now, timeZone);
  if (!festivalDay) return null;

  const nowMinutes = preview?.minutes ?? getMinutesInTimeZone(now, timeZone);
  const dayItems = items
    .filter((item) => sessionDay.get(item.sessionId) === festivalDay)
    .sort((a, b) => parseScheduleTime(a.startTime) - parseScheduleTime(b.startTime));

  if (dayItems.length === 0) return null;

  let current: ScheduleItem | null = null;
  for (const item of dayItems) {
    if (parseScheduleTime(item.startTime) <= nowMinutes) current = item;
    else break;
  }

  return current?.id ?? null;
}
