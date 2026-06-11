"use client";

import { useMemo, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import type { PrizeTier, PrizeRedemption } from "@/lib/data/challenges-v2";

export function RewardsClient({
  tiers,
  initialBalance,
  initialRedemptions,
}: {
  tiers: PrizeTier[];
  initialBalance: number;
  initialRedemptions: PrizeRedemption[];
}) {
  const [balance, setBalance] = useState(initialBalance);
  const [redemptions, setRedemptions] = useState<PrizeRedemption[]>(initialRedemptions);
  const [pendingTierId, setPendingTierId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const redeemedTierIds = useMemo(
    () => new Set(redemptions.map((r) => r.tierId)),
    [redemptions]
  );

  function redeem(tier: PrizeTier) {
    setError(null);
    setPendingTierId(tier.id);
    startTransition(async () => {
      const res = await fetch(`/api/prize-tiers/${tier.id}/redeem`, { method: "POST" });
      const data = (await res.json()) as
        | { ok: true; voucherCode: string; cost: number; balance: number }
        | { ok: false; error: string };
      if (data.ok) {
        setBalance(data.balance);
        setRedemptions((prev) => [
          ...prev,
          {
            id: `red-${tier.id}-${Date.now()}`,
            userId: "",
            tierId: tier.id,
            costPoints: data.cost,
            voucherCode: data.voucherCode,
            claimedAt: new Date().toISOString(),
            redeemedAt: null,
          },
        ]);
      } else {
        setError(errorLabel(data.error));
      }
      setPendingTierId(null);
    });
  }

  return (
    <div className="space-y-10">
      <div className="rounded-md border border-brand-green/30 bg-brand-green/5 p-5 sm:p-6 flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <div>
          <p className="brand-section-label !text-brand-green">Your balance</p>
          <p className="font-display text-5xl text-brand-green tabular-nums leading-none">
            {balance}
          </p>
        </div>
        <p className="text-sm text-white/70 max-w-md">
          Spend points to redeem a reward. Once redeemed, your balance drops by
          the cost. Pick up physical prizes at the festival reward shop using your
          voucher code.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-brand-orange" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((t) => {
          const owned = redeemedTierIds.has(t.id);
          const affordable = balance >= t.costPoints;
          const outOfStock = t.stock === 0;
          const accent = t.accent;
          const accentBg = {
            green: "bg-brand-green",
            orange: "bg-brand-orange",
            blue: "bg-brand-blue",
          }[accent];
          const accentText = {
            green: "text-brand-green",
            orange: "text-brand-orange",
            blue: "text-brand-blue",
          }[accent];
          const accentBorder = {
            green: "border-brand-green/40",
            orange: "border-brand-orange/40",
            blue: "border-brand-blue/40",
          }[accent];
          return (
            <article
              key={t.id}
              className={cn(
                "relative rounded-md border bg-white/[0.02] p-5 flex flex-col gap-3",
                owned ? "border-brand-green/40 bg-brand-green/[0.04]" : accentBorder
              )}
            >
              <div className="text-3xl">{t.emoji}</div>
              <h3 className="font-display text-2xl leading-tight">{t.name}</h3>
              <p className="text-sm text-white/70 flex-1">{t.description}</p>
              <div className="flex items-baseline justify-between">
                <span className={cn("font-display text-2xl tabular-nums", accentText)}>
                  {t.costPoints} <span className="text-sm">pts</span>
                </span>
                {t.stock > 0 ? (
                  <span className="brand-section-label !text-white/55">
                    {t.stock} left
                  </span>
                ) : null}
              </div>
              {owned ? (
                <div className="brand-section-label !text-brand-green flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-brand-black text-[10px] font-bold",
                      accentBg
                    )}
                    aria-hidden
                  >
                    ✓
                  </span>
                  Redeemed
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => redeem(t)}
                  disabled={
                    !affordable ||
                    outOfStock ||
                    (isPending && pendingTierId === t.id)
                  }
                  className={cn(
                    "inline-flex items-center justify-center font-mono uppercase tracking-widest text-[11px] px-3 py-2 text-brand-black transition-opacity disabled:opacity-50",
                    accentBg
                  )}
                >
                  {outOfStock
                    ? "Out of stock"
                    : !affordable
                      ? `Need ${t.costPoints - balance} more`
                      : isPending && pendingTierId === t.id
                        ? "Redeeming…"
                        : "Redeem"}
                </button>
              )}
            </article>
          );
        })}
      </div>

      {redemptions.length > 0 ? (
        <section>
          <h2 className="brand-section-label mb-3">Your vouchers</h2>
          <div className="rounded border border-white/10 divide-y divide-white/10">
            {redemptions.map((r) => {
              const tier = tiers.find((t) => t.id === r.tierId);
              return (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm"
                >
                  <span className="text-xl">{tier?.emoji ?? "🎁"}</span>
                  <span className="font-display">{tier?.name ?? r.tierId}</span>
                  <span className="font-mono text-xs text-white/55">
                    −{r.costPoints} pts
                  </span>
                  <code className="ml-auto rounded bg-white/10 px-2 py-1 font-mono text-xs">
                    {r.voucherCode}
                  </code>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function errorLabel(code: string): string {
  switch (code) {
    case "insufficient_points":
      return "Not enough points yet.";
    case "out_of_stock":
      return "This prize is out of stock.";
    case "invalid_tier":
      return "Prize tier not found.";
    case "not_logged_in":
      return "Please log in.";
    default:
      return "Something went wrong. Try again.";
  }
}
