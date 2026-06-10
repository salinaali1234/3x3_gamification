"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WheelPrize } from "@/lib/data/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SpinPrize = {
  id: string;
  label: { nl: string; en: string } | string;
  emoji: string;
};

type SpinResult =
  | {
      ok: true;
      prize: SpinPrize;
      pickupCode?: string;
      spinsRemaining: number;
    }
  | { ok: false; error: string };

function prizeLabel(prize: SpinPrize, locale: Locale): string {
  if (typeof prize.label === "string") return prize.label;
  return prize.label[locale];
}

export function WheelClient({
  locale,
  dict,
  spinsAvailable: initialSpins,
  spinsEarned,
  spinsUsed,
  stepsDone,
  stepsTotal,
  prizes,
}: {
  locale: Locale;
  dict: Dictionary;
  spinsAvailable: number;
  spinsEarned: number;
  spinsUsed: number;
  stepsDone: number;
  stepsTotal: number;
  prizes: WheelPrize[];
}) {
  const [spinsAvailable, setSpinsAvailable] = useState(initialSpins);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<SpinResult | null>(null);
  const router = useRouter();

  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
  const journeyComplete = stepsDone >= stepsTotal;
  const remaining = Math.max(0, stepsTotal - stepsDone);

  async function spin() {
    if (spinning || spinsAvailable < 1) return;
    setSpinning(true);
    setResult(null);
    const extraTurns = 4 + Math.floor(Math.random() * 3);
    setRotation((r) => r + extraTurns * 360 + Math.random() * 360);

    try {
      await new Promise((r) => setTimeout(r, 2800));
      const res = await fetch("/api/wheel/spin", { method: "POST" });
      const data = (await res.json()) as SpinResult;
      setResult(data);
      if (data.ok) {
        setSpinsAvailable(data.spinsRemaining);
        router.refresh();
      }
    } finally {
      setSpinning(false);
    }
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Journey progress */}
      <div className="rounded-md border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-mono uppercase tracking-wider text-white/50">
            Main quest
          </span>
          <span className="font-mono tabular-nums text-brand-green px-1 tracking-wide">
            {stepsDone}/{stepsTotal}
          </span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              journeyComplete ? "bg-brand-green" : "bg-brand-orange"
            )}
            style={{
              width: `${stepsTotal > 0 ? Math.min(100, (stepsDone / stepsTotal) * 100) : 0}%`,
            }}
          />
        </div>
        <p className="mt-3 text-sm text-white/65">
          {journeyComplete
            ? dict.wheel.progressComplete
            : dict.wheel.progress
                .replace("{done}", String(stepsDone))
                .replace("{total}", String(stepsTotal))
                .replace("{remaining}", String(remaining))}
        </p>
      </div>

      <div className="flex items-center justify-center gap-6 rounded-md border border-brand-orange/40 bg-brand-orange/10 px-6 py-7 sm:px-8 sm:py-8">
        <div className="min-w-[4.5rem] text-center">
          <div className="brand-section-label !text-brand-orange">
            {dict.wheel.spinsAvailable}
          </div>
          <div className="mt-1 font-mono text-6xl text-brand-orange tabular-nums leading-tight tracking-wide py-1">
            {spinsAvailable}
          </div>
        </div>
        <div className="text-5xl">🎡</div>
      </div>

      <div className="flex flex-col items-center">
        <div
          className="relative h-64 w-64 sm:h-72 sm:w-72 transition-transform duration-[2800ms] ease-out"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-brand-black bg-gradient-to-br from-brand-orange via-brand-green to-brand-blue" />
          <div className="absolute inset-4 rounded-full border-2 border-white/30 bg-brand-black/80 grid place-items-center">
            <span className="font-display text-2xl text-brand-green">3X3</span>
          </div>
        </div>
        <div className="relative -mt-4 z-10 text-3xl">▼</div>
      </div>

      <div className="text-center">
        <Button
          onClick={spin}
          disabled={spinning || spinsAvailable < 1}
          variant="primary"
          size="lg"
          className="w-full max-w-xs sm:w-auto sm:max-w-none"
        >
          {spinning ? dict.wheel.spinning : dict.wheel.spinCta}
        </Button>
        {spinsAvailable < 1 ? (
          <p className="mt-3 text-sm text-white/50">
            {!journeyComplete
              ? dict.wheel.noSpinsNeedJourney.replace(
                  "{remaining}",
                  String(remaining)
                )
              : spinsUsed > 0
              ? dict.wheel.noSpinsUsed
                  .replace("{used}", String(spinsUsed))
                  .replace("{earned}", String(spinsEarned))
              : dict.wheel.noSpins}
          </p>
        ) : (
          <p className="mt-3 text-xs text-white/45 max-w-md mx-auto">
            {dict.wheel.acceptTerms}
          </p>
        )}
      </div>

      {result?.ok ? (
        <div className="rounded-md border border-brand-green/40 bg-brand-green/10 p-6 text-center">
          <div className="text-5xl mb-2">{result.prize.emoji}</div>
          <div className="brand-section-label !text-brand-green mb-1">
            {dict.wheel.youWon}
          </div>
          <h3 className="font-display text-3xl">{prizeLabel(result.prize, locale)}</h3>
          {result.pickupCode ? (
            <div className="mt-4 mx-auto max-w-sm rounded border border-dashed border-brand-green/50 bg-brand-green/[0.04] p-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-brand-green">
                {dict.wheel.pickupCode}
              </div>
              <div className="mt-1 font-mono text-xl tabular-nums tracking-wide text-brand-green select-all">
                {result.pickupCode}
              </div>
              <p className="mt-2 text-xs text-white/50">{dict.wheel.pickupHint}</p>
            </div>
          ) : null}
          <p className="mt-2 text-sm text-white/60">
            {dict.wheel.spinsLeft}: {result.spinsRemaining}
          </p>
        </div>
      ) : result && !result.ok ? (
        <div className="rounded-md border border-brand-orange/40 bg-brand-orange/10 p-4 text-sm text-center">
          {result.error === "no_spins" ? dict.wheel.noSpins : result.error}
        </div>
      ) : null}

      <div className="rounded-md border border-white/10 bg-white/[0.02] p-4 text-sm text-white/60">
        <p className="brand-section-label mb-2">{dict.wheel.howToEarn}</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>{dict.wheel.earnSteps}</li>
          <li>{dict.wheel.earnComplete}</li>
          <li>{dict.wheel.earnSpinAgain}</li>
        </ul>
      </div>

      <div className="rounded-md border border-brand-blue/30 bg-brand-blue/5 p-4">
        <p className="brand-section-label mb-3 !text-brand-blue">
          {dict.wheel.prizesTitle}
        </p>
        <p className="mb-4 text-xs text-white/55">{dict.wheel.prizesNote}</p>
        <ul className="space-y-2">
          {prizes.map((prize) => (
            <li
              key={prize.id}
              className="flex items-center justify-between gap-3 text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0"
            >
              <span className="flex items-center gap-2 min-w-0">
                <span>{prize.emoji}</span>
                <span className="truncate">{prize.label[locale]}</span>
              </span>
              <span className="shrink-0 font-mono text-xs tabular-nums text-white/50">
                {totalWeight > 0
                  ? `${Math.round((prize.weight / totalWeight) * 100)}%`
                  : "—"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-md border border-white/10 bg-white/[0.02] p-4 text-sm text-white/60">
        <p className="brand-section-label mb-2">{dict.wheel.legalTitle}</p>
        <p className="mb-3 text-xs leading-relaxed text-white/55">
          {dict.wheel.legalIntro}
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-xs leading-relaxed">
          {dict.wheel.legalBullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
