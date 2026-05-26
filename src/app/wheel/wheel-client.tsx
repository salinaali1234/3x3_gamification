"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";

type SpinResult =
  | {
      ok: true;
      prize: { id: string; label: { nl: string; en: string }; emoji: string };
      spinsRemaining: number;
    }
  | { ok: false; error: string };

export function WheelClient({
  locale,
  dict,
  spinsAvailable: initialSpins,
}: {
  locale: Locale;
  dict: Dictionary;
  spinsAvailable: number;
}) {
  const [spinsAvailable, setSpinsAvailable] = useState(initialSpins);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<SpinResult | null>(null);
  const router = useRouter();

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
      <div className="flex items-center justify-center gap-6 rounded-md border border-brand-orange/40 bg-brand-orange/10 p-6">
        <div>
          <div className="brand-section-label !text-brand-orange">
            {dict.wheel.spinsAvailable}
          </div>
          <div className="font-display text-6xl text-brand-orange tabular-nums">
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
        >
          {spinning ? dict.wheel.spinning : dict.wheel.spinCta}
        </Button>
        {spinsAvailable < 1 ? (
          <p className="mt-3 text-sm text-white/50">{dict.wheel.noSpins}</p>
        ) : null}
      </div>

      {result?.ok ? (
        <div className="rounded-md border border-brand-green/40 bg-brand-green/10 p-6 text-center">
          <div className="text-5xl mb-2">{result.prize.emoji}</div>
          <div className="brand-section-label !text-brand-green mb-1">
            {dict.wheel.youWon}
          </div>
          <h3 className="font-display text-3xl">{result.prize.label[locale]}</h3>
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
          <li>{dict.wheel.earnHalfway}</li>
          <li>{dict.wheel.earnComplete}</li>
          <li>{dict.wheel.earnAllChallenges}</li>
        </ul>
      </div>
    </div>
  );
}
