"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Reward } from "@/lib/data/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TierStatus = "claimed" | "unlocked" | "locked" | "soldOut";

function PointsPill({
  value,
  accent,
  size = "sm",
  className,
}: {
  value: number;
  accent?: "green" | "orange" | "blue" | "muted";
  size?: "sm" | "md";
  className?: string;
}) {
  const accentStyles = {
    green: "bg-brand-green text-brand-black",
    orange: "bg-brand-orange text-brand-black",
    blue: "bg-brand-blue text-brand-black",
    muted: "bg-white/10 text-white/70",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded font-mono tabular-nums leading-none whitespace-nowrap",
        size === "md" ? "min-h-8 px-3 py-1.5 text-sm gap-1.5" : "min-h-6 px-2 py-1 text-xs gap-1",
        accent ? accentStyles[accent] : accentStyles.muted,
        className
      )}
    >
      <span>{value}</span>
      <span className={cn("uppercase", size === "md" ? "text-[11px] opacity-80" : "text-[10px] opacity-75")}>
        pts
      </span>
    </span>
  );
}

function TierNode({
  status,
  tierNum,
}: {
  status: TierStatus;
  tierNum: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
        status === "claimed"
          ? "border-brand-green bg-brand-green text-brand-black"
          : status === "unlocked"
          ? "border-brand-orange bg-brand-orange text-brand-black shadow-[0_0_16px_rgba(255,103,1,0.4)]"
          : status === "soldOut"
          ? "border-white/20 bg-ink-soft text-white/35"
          : "border-white/20 bg-brand-black text-white/40"
      )}
    >
      {status === "claimed" ? (
        <span className="text-sm leading-none">✓</span>
      ) : status === "unlocked" ? (
        <span className="font-mono text-xs tabular-nums leading-none">{tierNum}</span>
      ) : status === "soldOut" ? (
        <span className="text-sm leading-none">×</span>
      ) : (
        <span className="text-xs leading-none">🔒</span>
      )}
    </div>
  );
}

function tierStatus(
  reward: Reward,
  userPoints: number,
  claimed: boolean,
  isLoggedIn: boolean
): TierStatus {
  if (claimed) return "claimed";
  if (!isLoggedIn) return "locked";
  if (reward.stock <= 0) return "soldOut";
  if (userPoints >= reward.costPoints) return "unlocked";
  return "locked";
}

export function RewardsList({
  rewards,
  locale,
  dict,
  userPoints,
  claimedIds,
  claimVouchers,
  isLoggedIn,
}: {
  rewards: Reward[];
  locale: Locale;
  dict: Dictionary;
  userPoints: number;
  claimedIds: string[];
  claimVouchers: Record<string, string>;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [freshVoucher, setFreshVoucher] = useState<{ rewardId: string; code: string } | null>(
    null
  );
  const claimedSet = new Set(claimedIds);

  const tiers = useMemo(
    () => [...rewards].sort((a, b) => a.costPoints - b.costPoints),
    [rewards]
  );

  const maxPoints = tiers[tiers.length - 1]?.costPoints ?? 0;
  const progressPct = maxPoints > 0 ? Math.min(100, (userPoints / maxPoints) * 100) : 0;

  const nextTier = tiers.find(
    (r) => !claimedSet.has(r.id) && userPoints < r.costPoints
  );
  const ptsToNext = nextTier ? nextTier.costPoints - userPoints : 0;

  async function claim(reward: Reward) {
    setClaimingId(reward.id);
    setFreshVoucher(null);
    try {
      const res = await fetch(`/api/rewards/${reward.id}/claim`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setFreshVoucher({ rewardId: reward.id, code: data.code });
        router.refresh();
      }
    } finally {
      setClaimingId(null);
    }
  }

  function voucherFor(rewardId: string) {
    if (freshVoucher?.rewardId === rewardId) return freshVoucher.code;
    return claimVouchers[rewardId] ?? null;
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Battle pass header */}
      <div className="relative overflow-hidden rounded-lg border border-brand-green/30 bg-gradient-to-br from-brand-green/[0.08] via-transparent to-brand-orange/[0.06] p-5 sm:p-6">
        <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="brand-section-label !text-brand-green mb-2">
              3X3 UNITES // {dict.rewards.battlePassSeason}
            </div>
            {isLoggedIn ? (
              <div className="flex items-end gap-3">
                <span className="font-mono text-5xl sm:text-6xl text-brand-green tabular-nums leading-none tracking-tight">
                  {userPoints}
                </span>
                <span className="pb-1 brand-section-label !text-white/50">
                  {dict.common.pointsShort}
                </span>
              </div>
            ) : (
              <p className="text-sm text-white/65">
                <Link href="/login" className="text-brand-green underline">
                  {dict.nav.login}
                </Link>{" "}
                {locale === "nl" ? "om je battle pass te zien." : "to view your battle pass."}
              </p>
            )}
          </div>
          {isLoggedIn ? (
            <div className="sm:text-right">
              <div className="brand-section-label mb-1">{dict.rewards.progress}</div>
              <p className="text-sm text-white/70">
                {nextTier
                  ? dict.rewards.ptsToNext.replace("{n}", String(ptsToNext))
                  : dict.rewards.maxTier}
              </p>
            </div>
          ) : null}
        </div>

        {isLoggedIn ? (
          <div className="relative mt-5">
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-green via-brand-green to-brand-orange transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[11px] tabular-nums uppercase tracking-wider text-white/40">
              <span>0 pts</span>
              <span>{maxPoints} pts</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Tier legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono uppercase tracking-wider">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-green" />
          {dict.common.claimed}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-orange animate-pulse" />
          {dict.rewards.unlockedTier}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          {dict.rewards.lockedTier}
        </span>
      </div>

      {/* Battle pass track */}
      <div className="relative -mx-4 sm:mx-0">
        <div className="overflow-x-auto px-4 sm:px-0 pb-2 snap-x snap-mandatory">
          <div
            className="grid snap-center min-w-max sm:min-w-0 sm:w-full gap-x-2 gap-y-0"
            style={{
              gridTemplateColumns: `repeat(${tiers.length}, minmax(168px, 1fr))`,
            }}
          >
            {tiers.map((reward, index) => {
              const status = tierStatus(reward, userPoints, claimedSet.has(reward.id), isLoggedIn);
              const tierNum = String(index + 1).padStart(2, "0");
              const voucher = voucherFor(reward.id);
              const isLast = index === tiers.length - 1;
              const nodeReached = userPoints >= reward.costPoints || status === "claimed";
              const segmentFilled =
                index < tiers.length - 1 &&
                (userPoints >= tiers[index + 1].costPoints ||
                  claimedSet.has(tiers[index + 1].id));

              return (
                <div key={reward.id} className="flex min-w-[168px] flex-col px-1 snap-center">
                  {/* Track row: connector + node + connector */}
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                    <div
                      className={cn(
                        "h-0.5 transition-colors",
                        index === 0 ? "opacity-0" : nodeReached ? "bg-brand-green" : "bg-white/15"
                      )}
                    />
                    <TierNode status={status} tierNum={tierNum} />
                    <div
                      className={cn(
                        "h-0.5 transition-colors",
                        isLast ? "opacity-0" : segmentFilled ? "bg-brand-green" : "bg-white/15"
                      )}
                    />
                  </div>

                  {/* Tier label + points threshold */}
                  <div className="mt-3 mb-3 flex flex-col items-center gap-2 text-center">
                    <div className="brand-section-label !text-[10px] !tracking-[0.14em]">
                      {dict.rewards.tier} {tierNum}
                    </div>
                    <PointsPill
                      value={reward.costPoints}
                      accent={nodeReached ? "green" : "muted"}
                      size="sm"
                    />
                  </div>

                  {/* Reward card */}
                  <article
                    className={cn(
                      "relative flex min-h-[240px] flex-col rounded-md border p-4 transition-all",
                      status === "claimed"
                        ? "border-brand-green/40 bg-brand-green/[0.06]"
                        : status === "unlocked"
                        ? "border-brand-orange/50 bg-brand-orange/[0.08] ring-1 ring-brand-orange/30"
                        : "border-white/10 bg-white/[0.02]",
                      status === "locked" && !isLoggedIn && "opacity-80",
                      status === "soldOut" && "opacity-60"
                    )}
                  >
                    {status === "locked" && isLoggedIn ? (
                      <div className="pointer-events-none absolute inset-0 rounded-md bg-brand-black/40 backdrop-blur-[1px]" />
                    ) : null}

                    <div className="relative flex items-start gap-3">
                      <span className="text-3xl leading-none">{reward.emoji}</span>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <h3 className="font-display text-xl leading-tight">{reward.name[locale]}</h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-white/65">
                          {reward.description[locale]}
                        </p>
                      </div>
                    </div>

                    <div className="relative mt-auto pt-4">
                      <div className="mb-3 font-mono text-[10px] uppercase tracking-wider text-white/35">
                        {dict.rewards.stock}:{" "}
                        <span className="tabular-nums text-white/55">{reward.stock}</span>
                      </div>

                      <div className="space-y-2">
                        {status === "claimed" ? (
                          <>
                            <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-brand-green">
                              ✓ {dict.common.claimed}
                            </span>
                            {voucher ? (
                              <div className="rounded border border-brand-green/40 bg-brand-black/50 p-3">
                                <div className="brand-section-label !text-[9px] !text-brand-green">
                                  {dict.rewards.yourVoucher}
                                </div>
                                <div className="mt-1 break-all font-mono text-sm tabular-nums leading-snug text-brand-green select-all">
                                  {voucher}
                                </div>
                                <p className="mt-2 text-[10px] leading-snug text-white/45">
                                  {dict.rewards.redeemHint}
                                </p>
                              </div>
                            ) : null}
                          </>
                        ) : !isLoggedIn ? (
                          <Button variant="outline" size="sm" disabled className="w-full">
                            {dict.nav.login}
                          </Button>
                        ) : status === "soldOut" ? (
                          <Button variant="outline" size="sm" disabled className="w-full">
                            {dict.rewards.outOfStock}
                          </Button>
                        ) : status === "locked" ? (
                          <Button variant="outline" size="sm" disabled className="w-full">
                            {dict.rewards.notEnoughPoints}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="primary"
                            className="w-full"
                            onClick={() => claim(reward)}
                            disabled={claimingId === reward.id}
                          >
                            {claimingId === reward.id ? "..." : dict.common.claim}
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
