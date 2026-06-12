import type { DayFlag, UnifiedChallenge } from "@/lib/data/challenges-v2";
import {
  FESTIVAL_DAY_DATES,
  getFestivalDayForDate,
  getMinutesInTimeZone,
  parseSchedulePreview,
  parseScheduleTime,
  type SchedulePreview,
} from "@/lib/schedule/now-playing";
import type { Locale } from "@/lib/i18n/config";

const LEAD_MINUTES = 15;

export function challengesWithSchedule(challenges: UnifiedChallenge[]): UnifiedChallenge[] {
  return challenges.filter((c) => c.dayFlag && c.schedule);
}

export function isChallengePopupActive(
  challenge: UnifiedChallenge,
  now: Date,
  preview?: SchedulePreview | null
): boolean {
  if (!challenge.dayFlag || !challenge.schedule) return false;

  const festivalDay = preview?.day ?? getFestivalDayForDate(now);
  if (festivalDay !== challenge.dayFlag) return false;

  const nowMinutes = preview?.minutes ?? getMinutesInTimeZone(now);
  const start = parseScheduleTime(challenge.schedule.startTime);
  const end = parseScheduleTime(challenge.schedule.endTime);

  return nowMinutes >= start - LEAD_MINUTES && nowMinutes <= end;
}

export function activeScheduledChallenges(
  challenges: UnifiedChallenge[],
  completedIds: Set<string>,
  now: Date,
  preview?: SchedulePreview | null
): UnifiedChallenge[] {
  return challengesWithSchedule(challenges).filter(
    (c) => !completedIds.has(c.id) && isChallengePopupActive(c, now, preview)
  );
}

export function formatChallengeScheduleDate(
  challenge: UnifiedChallenge,
  locale: Locale,
  dict: { schedule: { days: Record<DayFlag, string> } }
): string {
  if (!challenge.dayFlag) return "";
  const date = FESTIVAL_DAY_DATES[challenge.dayFlag];
  const dayLabel = dict.schedule.days[challenge.dayFlag];
  const formatted = new Date(`${date}T12:00:00`).toLocaleDateString(
    locale === "nl" ? "nl-NL" : "en-GB",
    { weekday: "short", day: "numeric", month: "short" }
  );
  return `${dayLabel} (${formatted})`;
}

export function formatChallengeScheduleWindow(challenge: UnifiedChallenge): string | null {
  if (!challenge.schedule) return null;
  return `${challenge.schedule.startTime}–${challenge.schedule.endTime}`;
}

export { parseSchedulePreview };
