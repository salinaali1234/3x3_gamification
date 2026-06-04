"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Challenge } from "@/lib/data/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";

type Props = {
  challenge: Challenge;
  locale: Locale;
  dict: Dictionary;
  alreadyDone: boolean;
  previousAnswer: unknown;
  pollResults: Record<number, number>;
};

export function ChallengeRunner({
  challenge,
  locale,
  dict,
  alreadyDone,
  previousAnswer,
  pollResults,
}: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    correct?: boolean;
    awarded?: number;
    correctAnswer?: unknown;
    newBadges?: { id: string; emoji: string; name: { nl: string; en: string } }[];
  } | null>(null);

  async function submit(answer: unknown) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/attempt`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      const data = await res.json();
      setResult(data);
      if (data.ok) router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (alreadyDone && !result) {
    return (
      <div className="rounded-md border border-brand-green/40 bg-brand-green/10 p-5">
        <p className="font-medium">{dict.challenges.alreadyDone}</p>
        {previousAnswer !== null && previousAnswer !== undefined ? (
          <p className="text-sm text-white/60 mt-1 font-mono">
            {locale === "nl" ? "Jouw antwoord:" : "Your answer:"}{" "}
            {String(previousAnswer)}
          </p>
        ) : null}
      </div>
    );
  }

  if (result?.ok) {
    return (
      <div
        className={`rounded-md border p-5 ${
          result.correct
            ? "border-brand-green/40 bg-brand-green/10"
            : "border-brand-orange/40 bg-brand-orange/10"
        }`}
      >
        <h3 className="font-display text-2xl">
          {result.correct ? dict.challenges.attemptSuccess : dict.challenges.attemptWrong}
        </h3>
        {result.awarded ? (
          <div className="mt-2 font-display text-3xl text-brand-green">
            +{result.awarded} pts
          </div>
        ) : null}
        {result.newBadges?.length ? (
          <div className="mt-4">
            <div className="brand-section-label mb-2">
              {locale === "nl" ? "Nieuwe badges!" : "New badges!"}
            </div>
            <div className="flex flex-wrap gap-2">
              {result.newBadges.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-green/20 border border-brand-green/40 px-3 py-1 text-sm"
                >
                  <span className="text-xl">{b.emoji}</span>
                  {b.name[locale]}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  switch (challenge.payload.type) {
    case "trivia":
      return (
        <TriviaForm
          data={challenge.payload.data}
          locale={locale}
          dict={dict}
          onSubmit={(idx) => submit(idx)}
          submitting={submitting}
        />
      );
    case "poll":
      return (
        <PollForm
          data={challenge.payload.data}
          locale={locale}
          dict={dict}
          results={pollResults}
          onSubmit={(idx) => submit(idx)}
          submitting={submitting}
        />
      );
    case "score_input":
      return (
        <ScoreInputForm
          data={challenge.payload.data}
          locale={locale}
          dict={dict}
          onSubmit={(s) => submit(s)}
          submitting={submitting}
        />
      );
    case "bingo":
      return (
        <BingoForm
          data={challenge.payload.data}
          locale={locale}
          dict={dict}
          onSubmit={(selected) => submit(selected)}
          submitting={submitting}
        />
      );
    case "panna_qr":
      return (
        <div className="rounded-md border border-brand-orange/40 bg-brand-orange/5 p-5 text-sm">
          <p className="mb-3">
            {locale === "nl"
              ? "Deze challenge wordt voltooid door de verstopte codes in te voeren."
              : "Complete this challenge by entering the hidden codes."}
          </p>
          <p className="text-white/70">
            <strong>{locale === "nl" ? "Hint:" : "Hint:"}</strong>{" "}
            {challenge.payload.data.hint[locale]}
          </p>
        </div>
      );
    case "photo":
      return (
        <div className="rounded-md border border-brand-green/40 bg-brand-green/5 p-5 text-sm">
          <p>
            {locale === "nl"
              ? "Upload een foto met hashtag"
              : "Upload a photo with hashtag"}{" "}
            <code className="font-mono">#{challenge.payload.data.hashtag}</code>{" "}
            {locale === "nl" ? "via" : "on"}{" "}
            <a href="/photos" className="text-brand-green underline">
              /photos
            </a>
            .
          </p>
        </div>
      );
    default:
      return null;
  }
}

function TriviaForm({
  data,
  locale,
  dict,
  onSubmit,
  submitting,
}: {
  data: Extract<Challenge["payload"], { type: "trivia" }>["data"];
  locale: Locale;
  dict: Dictionary;
  onSubmit: (idx: number) => void;
  submitting: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="space-y-4">
      <p className="font-display text-2xl">{data.question[locale]}</p>
      <div className="grid gap-2">
        {data.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(i)}
            className={`text-left rounded-md border px-4 py-3 transition-colors ${
              selected === i
                ? "border-brand-green bg-brand-green/10"
                : "border-white/15 bg-white/[0.03] hover:border-white/30"
            }`}
          >
            <span className="font-mono text-xs text-white/40 mr-2">
              {String.fromCharCode(65 + i)}
            </span>
            {opt[locale]}
          </button>
        ))}
      </div>
      <Button
        onClick={() => selected !== null && onSubmit(selected)}
        disabled={selected === null || submitting}
      >
        {submitting ? "..." : dict.common.submit}
      </Button>
    </div>
  );
}

function PollForm({
  data,
  locale,
  dict,
  results,
  onSubmit,
  submitting,
}: {
  data: Extract<Challenge["payload"], { type: "poll" }>["data"];
  locale: Locale;
  dict: Dictionary;
  results: Record<number, number>;
  onSubmit: (idx: number) => void;
  submitting: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const total = Object.values(results).reduce((s, n) => s + n, 0) + 1;
  return (
    <div className="space-y-4">
      <p className="font-display text-2xl">{data.question[locale]}</p>
      <div className="grid gap-2">
        {data.options.map((opt, i) => {
          const pct = total ? Math.round(((results[i] ?? 0) / total) * 100) : 0;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              className={`relative text-left rounded-md border px-4 py-3 overflow-hidden ${
                selected === i
                  ? "border-brand-green"
                  : "border-white/15 bg-white/[0.03] hover:border-white/30"
              }`}
            >
              <span
                className="absolute inset-y-0 left-0 bg-brand-green/15"
                style={{ width: `${pct}%` }}
              />
              <span className="relative flex justify-between">
                <span>
                  <span className="font-mono text-xs text-white/40 mr-2">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt[locale]}
                </span>
                <span className="text-xs font-mono text-white/50">{pct}%</span>
              </span>
            </button>
          );
        })}
      </div>
      <Button
        onClick={() => selected !== null && onSubmit(selected)}
        disabled={selected === null || submitting}
      >
        {submitting ? "..." : dict.common.submit}
      </Button>
    </div>
  );
}

function ScoreInputForm({
  data,
  locale,
  dict,
  onSubmit,
  submitting,
}: {
  data: Extract<Challenge["payload"], { type: "score_input" }>["data"];
  locale: Locale;
  dict: Dictionary;
  onSubmit: (s: string) => void;
  submitting: boolean;
}) {
  const [score, setScore] = useState("");
  return (
    <div className="space-y-4">
      <p className="font-display text-2xl">{data.matchLabel[locale]}</p>
      <p className="text-sm text-white/60">
        {locale === "nl"
          ? "Voer de eindstand in als 'XX-YY' (bijv. 21-18)"
          : "Enter the final score as 'XX-YY' (e.g. 21-18)"}
      </p>
      <input
        type="text"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        placeholder="21-18"
        className="w-full max-w-xs rounded border border-white/15 bg-brand-black px-3 py-2 font-mono text-lg focus:border-brand-green focus:outline-none"
      />
      <div>
        <Button onClick={() => onSubmit(score)} disabled={!score || submitting}>
          {submitting ? "..." : dict.common.submit}
        </Button>
      </div>
    </div>
  );
}

function BingoForm({
  data,
  locale,
  dict,
  onSubmit,
  submitting,
}: {
  data: Extract<Challenge["payload"], { type: "bingo" }>["data"];
  locale: Locale;
  dict: Dictionary;
  onSubmit: (s: number[]) => void;
  submitting: boolean;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  function toggle(i: number) {
    const next = new Set(selected);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setSelected(next);
  }
  return (
    <div className="space-y-4">
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${data.rowSize}, minmax(0, 1fr))` }}
      >
        {data.squares.map((sq, i) => {
          const on = selected.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              className={`aspect-square rounded border text-xs p-2 text-left ${
                on
                  ? "border-brand-green bg-brand-green text-brand-black"
                  : "border-white/15 bg-white/[0.03] hover:border-white/30"
              }`}
            >
              {sq[locale]}
            </button>
          );
        })}
      </div>
      <Button onClick={() => onSubmit([...selected])} disabled={submitting}>
        {submitting ? "..." : dict.common.submit}
      </Button>
    </div>
  );
}
