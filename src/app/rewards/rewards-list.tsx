"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Reward } from "@/lib/data/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button, ButtonLink } from "@/components/ui/button";
import { accentClass, cn } from "@/lib/utils";

type TierStatus = "claimed" | "unlocked" | "locked" | "soldOut";

function tierStatus(
  reward: Reward,
  stock: number,
  passPoints: number,
  claimed: boolean,
  isLoggedIn: boolean
): TierStatus {
  if (claimed) return "claimed";
  if (!isLoggedIn) return "locked";
  if (stock <= 0) return "soldOut";
  if (passPoints >= reward.costPoints) return "unlocked";
  return "locked";
}

function formatPts(n: number, locale: Locale) {
  return n.toLocaleString(locale === "nl" ? "nl-NL" : "en-US");
}

export function RewardsList({
  rewards,
  locale,
  dict,
  userPoints,
  claimedIds,
  claimVouchers,
  claimRedeemed,
  isLoggedIn,
}: {
  rewards: Reward[];
  locale: Locale;
  dict: Dictionary;
  userPoints: number;
  claimedIds: string[];
  claimVouchers: Record<string, string>;
  claimRedeemed: Record<string, string | null>;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [freshVoucher, setFreshVoucher] = useState<{ rewardId: string; code: string } | null>(
    null
  );
  const [stockById, setStockById] = useState<Record<string, number>>(() =>
    Object.fromEntries(rewards.map((r) => [r.id, r.stock]))
  );
  const [localClaimedIds, setLocalClaimedIds] = useState<string[]>([]);

  useEffect(() => {
    setStockById(Object.fromEntries(rewards.map((r) => [r.id, r.stock])));
  }, [rewards]);

  const claimedSet = useMemo(
    () => new Set([...claimedIds, ...localClaimedIds]),
    [claimedIds, localClaimedIds]
  );

  const tiers = useMemo(
    () => [...rewards].sort((a, b) => a.costPoints - b.costPoints),
    [rewards]
  );

  const maxPoints = tiers[tiers.length - 1]?.costPoints ?? 0;
  const tiersUnlocked = tiers.filter((t) => userPoints >= t.costPoints).length;
  const claimedCount = tiers.filter((t) => claimedSet.has(t.id)).length;

  const nextTier = tiers.find((r) => !claimedSet.has(r.id) && userPoints < r.costPoints);
  const ptsToNext = nextTier ? nextTier.costPoints - userPoints : 0;
  const focusTierId =
    tiers.find((r) => !claimedSet.has(r.id) && userPoints >= r.costPoints)?.id ??
    nextTier?.id;

  const progressPct =
    maxPoints > 0 ? Math.min(100, (userPoints / maxPoints) * 100) : 0;

  async function claim(reward: Reward) {
    setClaimingId(reward.id);
    setFreshVoucher(null);
    try {
      const res = await fetch(`/api/rewards/${reward.id}/claim`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setFreshVoucher({ rewardId: reward.id, code: data.code });
        setLocalClaimedIds((prev) =>
          prev.includes(reward.id) ? prev : [...prev, reward.id]
        );
        if (typeof data.stockRemaining === "number") {
          setStockById((prev) => ({ ...prev, [reward.id]: data.stockRemaining }));
        } else {
          setStockById((prev) => ({
            ...prev,
            [reward.id]: Math.max(0, (prev[reward.id] ?? reward.stock) - 1),
          }));
        }
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
      {/* Summary card */}
      <div className="rounded-md border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="border-b border-white/10 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-brand-green px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-brand-black">
              3X3 UNITES
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/45">
              {dict.rewards.passSeason}
            </span>
          </div>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl uppercase leading-none">
            {dict.rewards.title}
          </h2>
        </div>

        {isLoggedIn ? (
          <div className="px-5 py-5 sm:px-6 space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-white/45">
                  {dict.rewards.passPointsLabel}
                </p>
                <p className="mt-1 font-display text-5xl tabular-nums text-brand-green leading-tight tracking-wide py-0.5">
                  {formatPts(userPoints, locale)}
                </p>
                <p className="mt-2 max-w-md text-sm text-white/55">
                  {dict.rewards.passPointsHint}
                </p>
              </div>
              <div className="flex gap-3">
                <SummaryStat
                  value={`${tiersUnlocked}/${tiers.length}`}
                  label={dict.rewards.tier}
                />
                <SummaryStat
                  value={String(claimedCount)}
                  label={dict.common.claimed}
                  accent
                />
              </div>
            </div>

            {/* Milestone track */}
            <div>
              <div className="relative mt-2 mb-8">
                <div className="absolute left-0 right-0 top-4 h-0.5 bg-white/10" />
                <div
                  className="absolute left-0 top-4 h-0.5 bg-brand-green transition-all"
                  style={{ width: `${progressPct}%` }}
                />
                <ol className="relative flex justify-between gap-1">
                  {tiers.map((tier, index) => {
                    const reached = userPoints >= tier.costPoints;
                    const claimed = claimedSet.has(tier.id);
                    return (
                      <li key={tier.id} className="flex flex-col items-center min-w-0 flex-1">
                        <span
                          className={cn(
                            "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 text-sm sm:text-base tabular-nums font-mono font-bold transition-colors",
                            claimed
                              ? "border-brand-green bg-brand-green text-brand-black"
                              : reached
                              ? "border-brand-orange bg-brand-orange text-brand-black"
                              : "border-white/20 bg-brand-black text-white/40"
                          )}
                        >
                          {claimed ? "✓" : index + 1}
                        </span>
                        <span className="mt-2 font-mono text-[11px] tabular-nums text-white/70 px-1 whitespace-nowrap">
                          {formatPts(tier.costPoints, locale)}
                        </span>
                        <span className="mt-0.5 text-lg leading-none" title={tier.name[locale]}>
                          {tier.emoji}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <p className="font-mono text-sm text-white/65">
                {nextTier ? (
                  <>
                    <span className="text-brand-orange uppercase tracking-wider">
                      {dict.rewards.nextReward}:
                    </span>{" "}
                    {nextTier.name[locale]} —{" "}
                    {dict.rewards.ptsToNext.replace("{n}", formatPts(ptsToNext, locale))}
                  </>
                ) : (
                  <span className="text-brand-green uppercase tracking-wider">
                    {dict.rewards.maxTier}
                  </span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <p className="px-5 py-5 sm:px-6 text-white/65">
            <Link href="/login" className="text-brand-green underline underline-offset-2">
              {dict.nav.login}
            </Link>{" "}
            {dict.rewards.loginToViewPass}
          </p>
        )}
      </div>

      {/* Tier cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiers.map((reward, index) => {
          const stock = stockById[reward.id] ?? reward.stock;
          const status = tierStatus(
            reward,
            stock,
            userPoints,
            claimedSet.has(reward.id),
            isLoggedIn
          );
          const tierNumber = index + 1;
          const voucher = voucherFor(reward.id);
          const isFocus = reward.id === focusTierId;
          const ptsNeeded = Math.max(0, reward.costPoints - userPoints);
          const tierProgress =
            reward.costPoints > 0
              ? Math.min(100, (userPoints / reward.costPoints) * 100)
              : 100;

          return (
            <article
              key={reward.id}
              className={cn(
                "flex flex-col overflow-hidden rounded-md border bg-brand-black transition-all",
                status === "claimed"
                  ? "border-brand-green/40"
                  : status === "unlocked"
                  ? "border-brand-orange/50"
                  : "border-white/10",
                isFocus && status === "unlocked" && "ring-1 ring-brand-orange/30"
              )}
            >
              <div className={cn("h-1 w-full shrink-0", accentClass(reward.accent, "bg"))} />

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-white/45">
                      {dict.rewards.tierAtPoints
                        .replace("{tier}", String(tierNumber))
                        .replace("{points}", formatPts(reward.costPoints, locale))}
                    </p>
                    <span
                      className={cn(
                        "mt-1 inline-block px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider",
                        reward.verifiable
                          ? "bg-brand-blue/20 text-brand-blue"
                          : "bg-white/10 text-white/50"
                      )}
                    >
                      {reward.verifiable
                        ? dict.rewards.verifiableReward
                        : dict.rewards.voucherReward}
                    </span>
                    <h3 className="mt-2 font-display text-2xl uppercase leading-tight">
                      {reward.name[locale]}
                    </h3>
                  </div>
                  <span className="text-4xl shrink-0">{reward.emoji}</span>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {reward.description[locale]}
                </p>

                {isLoggedIn && status !== "claimed" ? (
                  <div className="mt-4">
                    <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-white/40">
                      <span>{dict.rewards.progress}</span>
                      <span className="tabular-nums">
                        {formatPts(Math.min(userPoints, reward.costPoints), locale)} /{" "}
                        {formatPts(reward.costPoints, locale)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          status === "unlocked" ? "bg-brand-orange" : "bg-white/25"
                        )}
                        style={{ width: `${tierProgress}%` }}
                      />
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <StatusTag status={status} dict={dict} />
                  <StockBadge stock={stock} locale={locale} dict={dict} />
                </div>

                <div className="mt-5 pt-4 border-t border-white/10">
                  {status === "claimed" ? (
                    <ClaimedBlock
                      voucher={voucher}
                      redeemedAt={claimRedeemed[reward.id] ?? null}
                      dict={dict}
                    />
                  ) : !isLoggedIn ? (
                    <ButtonLink href="/login" variant="outline" size="sm" className="w-full">
                      {dict.nav.login}
                    </ButtonLink>
                  ) : status === "soldOut" ? (
                    <Button variant="outline" size="sm" disabled className="w-full">
                      {dict.rewards.outOfStock}
                    </Button>
                  ) : status === "unlocked" ? (
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full"
                      onClick={() => claim(reward)}
                      disabled={claimingId === reward.id}
                    >
                      {claimingId === reward.id ? "..." : dict.common.claim}
                    </Button>
                  ) : (
                    <div className="space-y-2.5">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-white/45">
                        {dict.rewards.ptsNeeded.replace("{n}", formatPts(ptsNeeded, locale))}
                      </p>
                      <ButtonLink
                        href="/challenges"
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        {dict.rewards.goEarnPoints}
                      </ButtonLink>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function SummaryStat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-[7.5rem] rounded-md border px-4 py-3",
        accent ? "border-brand-green/35 bg-brand-green/10" : "border-white/10 bg-white/[0.03]"
      )}
    >
      <div
        className={cn(
          "font-display text-2xl tabular-nums leading-tight tracking-wide py-0.5",
          accent ? "text-brand-green" : "text-white"
        )}
      >
        {value}
      </div>
      <div className="mt-1 text-[10px] leading-snug text-white/45">{label}</div>
    </div>
  );
}

function StockBadge({
  stock,
  locale,
  dict,
}: {
  stock: number;
  locale: Locale;
  dict: Dictionary;
}) {
  const formatted = stock.toLocaleString(locale === "nl" ? "nl-NL" : "en-US");

  if (stock <= 0) {
    return (
      <span className="font-mono text-xs font-bold uppercase tracking-wider text-white/35">
        {dict.rewards.outOfStock}
      </span>
    );
  }

  const low = stock <= 10;

  return (
    <span
      className={cn(
        "font-mono text-xs font-bold uppercase tracking-wider tabular-nums",
        low ? "text-brand-orange" : "text-brand-green"
      )}
    >
      {dict.rewards.stockAvailable.replace("{n}", formatted)}
      {low ? ` · ${dict.rewards.stockLow.replace("{n}", formatted)}` : ""}
    </span>
  );
}

function StatusTag({ status, dict }: { status: TierStatus; dict: Dictionary }) {
  const styles: Record<TierStatus, string> = {
    claimed: "bg-brand-green text-brand-black",
    unlocked: "bg-brand-orange text-brand-black",
    locked: "bg-white/10 text-white/50",
    soldOut: "bg-white/10 text-white/40",
  };
  const labels: Record<TierStatus, string> = {
    claimed: dict.common.claimed,
    unlocked: dict.rewards.unlockedTier,
    locked: dict.rewards.lockedTier,
    soldOut: dict.rewards.outOfStock,
  };
  return (
    <span
      className={cn(
        "px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}

function ClaimedBlock({
  voucher,
  redeemedAt,
  dict,
}: {
  voucher: string | null;
  redeemedAt: string | null;
  dict: Dictionary;
}) {
  return (
    <div className="space-y-3">
      <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-brand-green">
        ✓ {dict.common.claimed}
      </span>
      {redeemedAt ? (
        <p className="text-xs text-brand-green/90">{dict.rewards.redeemed}</p>
      ) : (
        <p className="text-xs text-brand-orange/90">{dict.rewards.pendingPickup}</p>
      )}
      {voucher ? (
        <div className="border border-dashed border-brand-green/50 bg-brand-green/[0.04] p-3">
          <div className="font-mono text-[9px] uppercase tracking-widest text-brand-green">
            {dict.rewards.yourVoucher}
          </div>
          <div className="mt-1 font-mono text-lg tabular-nums leading-snug text-brand-green select-all break-all">
            {voucher}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-white/45">
            {dict.rewards.redeemHint}
          </p>
        </div>
      ) : null}
    </div>
  );
}
