"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Reward } from "@/lib/data/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { accentClass, cn } from "@/lib/utils";

export function RewardsList({
  rewards,
  locale,
  dict,
  userPoints,
  claimedIds,
  isLoggedIn,
}: {
  rewards: Reward[];
  locale: Locale;
  dict: Dictionary;
  userPoints: number;
  claimedIds: string[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [voucher, setVoucher] = useState<{ rewardId: string; code: string } | null>(null);
  const claimedSet = new Set(claimedIds);

  async function claim(reward: Reward) {
    setClaimingId(reward.id);
    setVoucher(null);
    try {
      const res = await fetch(`/api/rewards/${reward.id}/claim`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setVoucher({ rewardId: reward.id, code: data.code });
        router.refresh();
      }
    } finally {
      setClaimingId(null);
    }
  }

  return (
    <div className="mt-8">
      {isLoggedIn ? (
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-green/40 bg-brand-green/10 px-4 py-2">
          <span className="brand-section-label !text-brand-green">
            {dict.common.yourPoints}
          </span>
          <span className="font-display text-2xl text-brand-green">
            {userPoints}
          </span>
        </div>
      ) : (
        <p className="mb-6 text-sm text-white/60">
          <Link href="/login" className="underline">
            {dict.nav.login}
          </Link>{" "}
          {locale === "nl" ? "om je punten te zien." : "to see your points."}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rewards.map((r) => {
          const canAfford = userPoints >= r.costPoints;
          const inStock = r.stock > 0;
          const claimed = claimedSet.has(r.id);
          return (
            <div
              key={r.id}
              className={cn(
                "rounded-md border p-5 flex flex-col",
                accentClass(r.accent, "border"),
                "bg-white/[0.02]"
              )}
            >
              <div className="flex items-start justify-between">
                <span className="text-5xl">{r.emoji}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-mono uppercase tracking-wider",
                    accentClass(r.accent, "bg"),
                    "text-brand-black"
                  )}
                >
                  {r.costPoints} pts
                </span>
              </div>
              <h3 className="mt-4 font-display text-2xl">{r.name[locale]}</h3>
              <p className="text-sm text-white/70 mt-1">{r.description[locale]}</p>
              <div className="mt-3 text-xs font-mono text-white/40 uppercase tracking-wider">
                {dict.rewards.stock}: {r.stock}
              </div>
              <div className="mt-4">
                {claimed ? (
                  <span className="brand-section-label !text-brand-green">
                    ✓ {dict.common.claimed}
                  </span>
                ) : !isLoggedIn ? (
                  <Button variant="outline" size="sm" disabled>
                    {dict.nav.login}
                  </Button>
                ) : !inStock ? (
                  <Button variant="outline" size="sm" disabled>
                    {dict.rewards.outOfStock}
                  </Button>
                ) : !canAfford ? (
                  <Button variant="outline" size="sm" disabled>
                    {dict.rewards.notEnoughPoints}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => claim(r)}
                    disabled={claimingId === r.id}
                  >
                    {claimingId === r.id ? "..." : dict.common.claim}
                  </Button>
                )}
                {voucher?.rewardId === r.id ? (
                  <div className="mt-3 rounded border border-brand-green/40 bg-brand-green/10 p-3">
                    <div className="brand-section-label !text-brand-green">
                      {dict.rewards.yourVoucher}
                    </div>
                    <div className="font-mono text-xl text-brand-green mt-1 select-all">
                      {voucher.code}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
