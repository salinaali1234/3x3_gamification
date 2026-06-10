"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";

type ScanResult =
  | {
      ok: true;
      type: "step" | "challenge";
      target: { id: string; title: { nl: string; en: string }; points?: number };
      pointsGained?: number;
      totalPoints?: number;
      wheelSpinsGained?: number;
      wheelSpinsAvailable?: number;
      journeyStepsRemaining?: number;
      journeyComplete?: boolean;
      newBadges: { id: string; emoji: string; name: { nl: string; en: string } }[];
    }
  | { ok: false; error: string };

export function ScanClient({
  locale,
  dict,
  hint,
  initialCode = "",
  showMapLink = false,
}: {
  locale: Locale;
  dict: Dictionary;
  hint?: string;
  initialCode?: string;
  showMapLink?: boolean;
}) {
  const [code, setCode] = useState(initialCode);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const router = useRouter();

  async function submit(value: string) {
    if (!value.trim() || submitting) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: value.trim() }),
      });
      const data = (await res.json()) as ScanResult;
      setResult(data);
      if (data.ok) {
        setCode("");
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-md border border-white/15 bg-white/[0.02] p-6">
        <label className="brand-section-label">{dict.scan.codeLabel}</label>
        <p className="mt-1 text-sm text-white/60">{dict.scan.subtitle}</p>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && submit(code)}
            placeholder={hint ?? dict.scan.manualPlaceholder}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            className="w-full sm:flex-1 min-w-0 rounded border border-white/15 bg-brand-black px-4 py-3 font-mono text-base sm:text-lg tracking-widest placeholder:text-white/30 focus:border-brand-green focus:outline-none"
          />
          <Button
            onClick={() => submit(code)}
            disabled={submitting || !code}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto sm:shrink-0"
          >
            {submitting ? "..." : dict.scan.submit}
          </Button>
        </div>
        {hint ? (
          <p className="mt-3 text-xs text-white/40 font-mono">
            {locale === "nl" ? "Hint: probeer" : "Hint: try"} {hint}
          </p>
        ) : null}
        {showMapLink ? (
          <p className="mt-4 text-xs text-white/40">
            <Link href="/#festival-map" className="text-brand-green hover:underline">
              {dict.scan.findOnMap} →
            </Link>
          </p>
        ) : null}
      </div>

      {result ? (
        result.ok ? (
          <div className="rounded-md border border-brand-green/40 bg-brand-green/10 p-5">
            <div className="brand-section-label !text-brand-green mb-1">
              {dict.scan.success}
            </div>
            <h3 className="font-display text-2xl">
              {result.target.title[locale]}
            </h3>
            {result.pointsGained && result.type === "challenge" ? (
              <div className="mt-2 font-display text-3xl text-brand-green">
                +{result.pointsGained} pts
              </div>
            ) : null}
            {result.type === "step" ? (
              <p className="mt-2 text-sm text-white/60">{dict.journey.stepCompletedHint}</p>
            ) : null}
            {result.totalPoints !== undefined && result.type === "challenge" ? (
              <p className="mt-1 text-sm text-white/60">
                {locale === "nl" ? "Totaal" : "Total"}: {result.totalPoints} pts
              </p>
            ) : null}
            {result.wheelSpinsGained ? (
              <p className="mt-2 text-sm text-brand-orange">
                {result.journeyComplete
                  ? locale === "nl"
                    ? "Alle main quests voltooid — je wheel-spin staat klaar! "
                    : "All main quests complete — your wheel spin is ready! "
                  : null}
                +{result.wheelSpinsGained}{" "}
                {result.wheelSpinsGained === 1 ? "wheel spin" : "wheel spins"}!{" "}
                <Link href="/wheel" className="underline hover:text-brand-green">
                  {dict.wheel.title} →
                </Link>
              </p>
            ) : result.journeyStepsRemaining !== undefined &&
              result.journeyStepsRemaining > 0 ? (
              <p className="mt-2 text-sm text-white/50">
                {locale === "nl"
                  ? `Nog ${result.journeyStepsRemaining} main quest(s) tot wheel-spin. `
                  : `${result.journeyStepsRemaining} main quest(s) left until wheel spin. `}
                <Link href="/journey" className="text-brand-green hover:underline">
                  Journey →
                </Link>
              </p>
            ) : result.wheelSpinsAvailable !== undefined ? (
              <p className="mt-2 text-sm text-white/50">
                <Link href="/wheel" className="hover:text-brand-green">
                  {dict.wheel.spinsAvailable}: {result.wheelSpinsAvailable}
                </Link>
              </p>
            ) : null}
            {result.newBadges?.length ? (
              <div className="mt-4">
                <div className="brand-section-label mb-2">
                  {locale === "nl" ? "Nieuwe badges!" : "New badges!"}
                </div>
                <div className="flex flex-wrap gap-3">
                  {result.newBadges.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-2 rounded-full bg-brand-green/20 border border-brand-green/40 px-3 py-1 text-sm"
                    >
                      <span className="text-xl">{b.emoji}</span>
                      <span>{b.name[locale]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-md border border-brand-orange/40 bg-brand-orange/10 p-5 text-sm">
            {result.error === "already"
              ? dict.scan.already
              : result.error === "invalid"
              ? dict.scan.invalid
              : result.error === "photo_required" ? (
                <span>
                  {dict.scan.photoRequired}{" "}
                  <Link href="/journey" className="text-brand-green underline">
                    {dict.scan.openJourney}
                  </Link>
                </span>
              ) : result.error === "leader_hub_locked"
              ? dict.scan.leaderHubLocked
              : result.error}
          </div>
        )
      ) : null}
    </div>
  );
}