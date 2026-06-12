"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { UnifiedChallenge } from "@/lib/data/challenges-v2";
import {
  activeScheduledChallenges,
  formatChallengeScheduleDate,
  formatChallengeScheduleWindow,
  parseSchedulePreview,
} from "@/lib/challenges/scheduled-popup";
import { accentClass } from "@/lib/utils";

type Props = {
  challenges: UnifiedChallenge[];
  completedIds: string[];
  locale: Locale;
  dict: Dictionary;
};

function dismissKey(challengeId: string, dayFlag: string) {
  return `challenge-popup-dismissed:${challengeId}:${dayFlag}`;
}

export function ChallengeSchedulePopup({
  challenges,
  completedIds,
  locale,
  dict,
}: Props) {
  const searchParams = useSearchParams();
  const preview = parseSchedulePreview(searchParams.get("preview"));
  const completed = useMemo(() => new Set(completedIds), [completedIds]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());
  const [storedDismissed, setStoredDismissed] = useState<Set<string>>(() => new Set());
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const dismissed = new Set<string>();
    for (const c of challenges) {
      if (c.dayFlag && localStorage.getItem(dismissKey(c.id, c.dayFlag))) {
        dismissed.add(c.id);
      }
    }
    setStoredDismissed(dismissed);
  }, [challenges]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const active = useMemo(
    () =>
      activeScheduledChallenges(challenges, completed, now, preview).filter(
        (c) => !dismissedIds.has(c.id) && !storedDismissed.has(c.id)
      ),
    [challenges, completed, now, preview, dismissedIds, storedDismissed]
  );

  const challenge = active[0];
  if (!challenge?.dayFlag || !challenge.schedule) return null;

  const accent = challenge.accent;
  const windowLabel = formatChallengeScheduleWindow(challenge);
  const dateLabel = formatChallengeScheduleDate(challenge, locale, dict);

  function dismiss() {
    localStorage.setItem(dismissKey(challenge.id, challenge.dayFlag!), "1");
    setDismissedIds((prev) => new Set(prev).add(challenge.id));
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-full max-w-md px-4">
      <div
        className={`rounded-md border bg-brand-black/95 p-5 shadow-xl backdrop-blur ${accentClass(accent, "border")}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={`brand-section-label ${accentClass(accent, "text")}`}>
              {dict.challengePopup.title}
            </p>
            <h3 className="mt-1 font-display text-xl uppercase leading-tight">
              {challenge.title}
            </h3>
            <p className="mt-0.5 text-xs font-mono text-white/50">{challenge.location}</p>
            <p className="mt-2 text-sm text-white/75">{dict.challengePopup.subtitle}</p>
            <p className="mt-2 text-xs font-mono uppercase tracking-wider text-white/55">
              {dateLabel}
              {windowLabel ? ` · ${windowLabel}` : null}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="text-white/50 hover:text-white shrink-0"
            aria-label={dict.challengePopup.dismiss}
          >
            ✕
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/challenges#challenge-${challenge.id}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-brand-green px-4 py-2.5 text-sm font-medium text-brand-black hover:bg-brand-green/90"
            onClick={dismiss}
          >
            {dict.challengePopup.cta}
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-4 py-2.5 text-sm text-white/70 hover:text-white"
          >
            {dict.challengePopup.later}
          </button>
        </div>
      </div>
    </div>
  );
}
