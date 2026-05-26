"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { LiveMatch } from "@/lib/data/types";
import { Button } from "@/components/ui/button";

type Props = {
  matches: LiveMatch[];
  alreadyDone: string[];
  locale: Locale;
  dict: Dictionary;
};

type Result =
  | { ok: true; correct: boolean; awardedPoints: number; finalScore: string }
  | { ok: false; error: string };

export function MatchScorePopup({ matches, alreadyDone, locale, dict }: Props) {
  const open = matches.filter((m) => m.finalScore && !alreadyDone.includes(m.id));
  const [dismissed, setDismissed] = useState(false);
  const [score, setScore] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const router = useRouter();

  const match = open[0];
  if (!match || dismissed) return null;

  async function submit() {
    if (!match || !score.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/matches/${match.id}/score`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ score: score.trim() }),
      });
      const data = (await res.json()) as Result;
      setResult(data);
      if (data.ok) router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-full max-w-md px-4">
      <div className="rounded-md border border-brand-orange/60 bg-brand-black/95 p-5 shadow-xl backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="brand-section-label !text-brand-orange">
              {dict.matchPopup.title}
            </p>
            <h3 className="mt-1 font-display text-xl">{match.label[locale]}</h3>
            <p className="mt-0.5 text-xs font-mono text-white/50">
              {match.day} · {match.startTime}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-white/50 hover:text-white"
            aria-label="close"
          >
            ✕
          </button>
        </div>

        {result?.ok ? (
          <div className="mt-3 text-sm">
            <p
              className={
                result.correct ? "text-brand-green" : "text-brand-orange"
              }
            >
              {result.correct
                ? dict.matchPopup.correct.replace(
                    "{points}",
                    String(result.awardedPoints)
                  )
                : dict.matchPopup.wrong.replace(
                    "{score}",
                    result.finalScore
                  )}
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-white/60">{dict.matchPopup.subtitle}</p>
            <div className="flex gap-2">
              <input
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="21-18"
                className="flex-1 rounded border border-white/15 bg-brand-black px-3 py-2 font-mono focus:border-brand-green focus:outline-none"
              />
              <Button onClick={submit} disabled={!score || submitting} variant="primary">
                {submitting ? "…" : dict.matchPopup.submit}
              </Button>
            </div>
            {result && !result.ok ? (
              <p className="text-xs text-brand-orange">
                {result.error === "not_final"
                  ? dict.matchPopup.notFinal
                  : result.error === "already"
                  ? dict.matchPopup.already
                  : result.error}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
