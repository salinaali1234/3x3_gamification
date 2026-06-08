"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Reward } from "@/lib/data/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button, ButtonLink } from "@/components/ui/button";
import { accentClass, cn } from "@/lib/utils";

type TierStatus = "claimed" | "unlocked" | "locked" | "soldOut";

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
  const tiersReached = tiers.filter(
    (t) => userPoints >= t.costPoints || claimedSet.has(t.id)
  ).length;
  const claimedCount = tiers.filter((t) => claimedSet.has(t.id)).length;

  const nextTier = tiers.find((r) => !claimedSet.has(r.id) && userPoints < r.costPoints);
  const ptsToNext = nextTier ? nextTier.costPoints - userPoints : 0;
  const focusTierId =
    tiers.find((r) => !claimedSet.has(r.id) && userPoints >= r.costPoints)?.id ??
    nextTier?.id;

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
    <div className="mt-8 space-y-10">
      {/* Poster-style hero */}
      <div className="relative overflow-hidden border border-white/10 bg-brand-black">
        <div className="absolute inset-0 fence-pattern opacity-40 pointer-events-none" />
        <div
          className="absolute -right-24 -top-24 h-64 w-64 rotate-12 bg-brand-green/10 blur-2xl pointer-events-none"
          aria-hidden
        />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-brand-green px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-brand-black">
              3X3 UNITES
            </span>
            <span className="font-mono text-[11px] uppercase tracking-widest text-white/55">
              {dict.rewards.battlePassSeason} · {dict.rewards.freeTrack}
            </span>
          </div>

          <h2 className="mt-5 font-display text-5xl sm:text-7xl leading-[0.85] uppercase">
            {dict.rewards.title}
          </h2>

          {isLoggedIn ? (
            <>
              <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-3">
                <div className="flex items-end gap-2">
                  <span className="font-display text-6xl sm:text-8xl leading-none text-brand-green tabular-nums">
                    {userPoints}
                  </span>
                  <span className="pb-2 font-mono text-sm uppercase tracking-widest text-white/45">
                    {dict.common.pointsShort}
                  </span>
                </div>
                <div className="flex gap-2 pb-1.5">
                  <PosterStat
                    value={`${tiersReached}/${tiers.length}`}
                    label={dict.rewards.tier}
                  />
                  <PosterStat
                    value={String(claimedCount)}
                    label={dict.common.claimed}
                    accent
                  />
                </div>
              </div>

              {/* Segmented progress */}
              <div className="mt-6">
                <div className="flex h-2.5 gap-1">
                  {tiers.map((tier) => {
                    const reached =
                      userPoints >= tier.costPoints || claimedSet.has(tier.id);
                    return (
                      <div
                        key={tier.id}
                        title={`${tier.costPoints} pts`}
                        className={cn(
                          "flex-1 transition-colors",
                          reached ? "bg-brand-green" : "bg-white/12"
                        )}
                      />
                    );
                  })}
                </div>
                <p className="mt-3 font-mono text-sm text-white/65">
                  {nextTier ? (
                    <>
                      <span className="text-brand-orange uppercase tracking-wider">
                        {dict.rewards.nextReward}:
                      </span>{" "}
                      {nextTier.name[locale]} —{" "}
                      <span className="text-white/80">
                        {dict.rewards.ptsToNext.replace("{n}", String(ptsToNext))}
                      </span>
                    </>
                  ) : (
                    <span className="text-brand-green uppercase tracking-wider">
                      {dict.rewards.maxTier}
                    </span>
                  )}
                </p>
              </div>
            </>
          ) : (
            <p className="mt-6 max-w-md text-white/65">
              <Link href="/login" className="text-brand-green underline underline-offset-2">
                {dict.nav.login}
              </Link>{" "}
              {locale === "nl" ? "om je battle pass te zien." : "to view your battle pass."}
            </p>
          )}
        </div>
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-green via-brand-orange to-brand-blue" />
      </div>

      {/* Tier poster grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiers.map((reward, index) => {
          const status = tierStatus(reward, userPoints, claimedSet.has(reward.id), isLoggedIn);
          const tierNum = String(index + 1).padStart(2, "0");
          const voucher = voucherFor(reward.id);
          const isFocus = reward.id === focusTierId;
          const ptsNeeded = Math.max(0, reward.costPoints - userPoints);
          const dimmed = status === "locked" || status === "soldOut";

          return (
            <article
              key={reward.id}
              className={cn(
                "group relative flex flex-col overflow-hidden border bg-brand-black transition-all",
                status === "claimed"
                  ? "border-brand-green/45"
                  : status === "unlocked"
                  ? "border-brand-orange/55 shadow-[0_0_40px_rgba(255,103,1,0.1)]"
                  : "border-white/10",
                isFocus && status === "unlocked" && "ring-1 ring-brand-orange/40"
              )}
            >
              {/* Top accent bar */}
              <div className={cn("h-1.5 w-full shrink-0", accentClass(reward.accent, "bg"))} />

              {/* Giant ghost tier number */}
              <span
                className="pointer-events-none absolute -right-3 -top-6 select-none font-display text-[9rem] leading-none text-white/[0.04]"
                aria-hidden
              >
                {tierNum}
              </span>

              <div className="relative flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-widest text-white/45">
                    {dict.rewards.tier} {tierNum}
                  </span>
                  <StatusTag status={status} dict={dict} />
                </div>

                <div
                  className={cn(
                    "mt-4 text-6xl transition-transform group-hover:scale-105",
                    dimmed && "grayscale opacity-60"
                  )}
                >
                  {reward.emoji}
                </div>

                <h3 className="mt-3 font-display text-3xl uppercase leading-[0.9]">
                  {reward.name[locale]}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {reward.description[locale]}
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex items-baseline gap-1 px-2.5 py-1 font-mono text-sm font-bold tabular-nums",
                      status === "claimed" || status === "unlocked"
                        ? "bg-brand-green text-brand-black"
                        : "bg-white/10 text-white/70"
                    )}
                  >
                    {reward.costPoints}
                    <span className="text-[10px] uppercase opacity-75">
                      {dict.common.pointsShort}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-white/35">
                    {dict.rewards.stock}:{" "}
                    <span className="tabular-nums text-white/55">{reward.stock}</span>
                  </span>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10">
                  {status === "claimed" ? (
                    <ClaimedBlock voucher={voucher} dict={dict} />
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
                      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-white/45">
                        <span>🔒 {dict.rewards.lockedTier}</span>
                        <span className="tabular-nums text-white/60">
                          {dict.rewards.ptsNeeded.replace("{n}", String(ptsNeeded))}
                        </span>
                      </div>
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

function PosterStat({
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
        "border px-3 py-1.5",
        accent ? "border-brand-green/40 bg-brand-green/10" : "border-white/12 bg-white/[0.03]"
      )}
    >
      <div
        className={cn(
          "font-display text-2xl leading-none tabular-nums",
          accent ? "text-brand-green" : "text-white"
        )}
      >
        {value}
      </div>
      <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-white/45">
        {label}
      </div>
    </div>
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

function ClaimedBlock({ voucher, dict }: { voucher: string | null; dict: Dictionary }) {
  return (
    <div className="space-y-3">
      <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-brand-green">
        ✓ {dict.common.claimed}
      </span>
      {voucher ? (
        <div className="relative overflow-hidden border border-dashed border-brand-green/50 bg-brand-green/[0.04] p-3">
          <div className="font-mono text-[9px] uppercase tracking-widest text-brand-green">
            {dict.rewards.yourVoucher}
          </div>
          <div className="mt-1 font-display text-2xl tabular-nums leading-none text-brand-green select-all break-all">
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
