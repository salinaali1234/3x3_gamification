"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { PrizeLookupRow } from "@/lib/supabase/redemptions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Labels = {
  searchPlaceholder: string;
  search: string;
  searching: string;
  hint: string;
  noResults: string;
  kindReward: string;
  kindWheel: string;
  claimedAt: string;
  redeemedAt: string;
  pending: string;
  markRedeemed: string;
  redeeming: string;
  alreadyRedeemed: string;
  notFound: string;
  errorGeneric: string;
};

export function RedemptionsClient({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Labels;
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PrizeLookupRow[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redeemingCode, setRedeemingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await fetch(`/api/admin/redemptions/lookup?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!data.ok) {
        setError(data.error === "query_too_short" ? labels.hint : labels.errorGeneric);
        setItems([]);
        return;
      }
      setItems(data.items ?? []);
    } catch {
      setError(labels.errorGeneric);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function redeem(item: PrizeLookupRow) {
    setRedeemingCode(item.code);
    setError(null);
    try {
      const res = await fetch("/api/admin/redemptions/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: item.kind, code: item.code }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(
          data.error === "already_redeemed"
            ? labels.alreadyRedeemed
            : data.error === "not_found"
            ? labels.notFound
            : labels.errorGeneric
        );
        return;
      }
      await search();
    } catch {
      setError(labels.errorGeneric);
    } finally {
      setRedeemingCode(null);
    }
  }

  function labelFor(item: PrizeLookupRow) {
    return locale === "nl" ? item.labelNl : item.labelEn;
  }

  function formatWhen(iso: string) {
    return new Date(iso).toLocaleString(locale === "nl" ? "nl-NL" : "en-GB", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm text-white/65">{labels.hint}</p>

      <form onSubmit={search} className="flex flex-col sm:flex-row gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="flex-1 rounded border border-white/15 bg-white/5 px-4 py-3 font-mono text-base tracking-wide placeholder:text-white/35 focus:border-brand-green focus:outline-none"
        />
        <Button type="submit" disabled={loading || query.trim().length < 2}>
          {loading ? labels.searching : labels.search}
        </Button>
      </form>

      {error ? (
        <p className="rounded border border-brand-orange/40 bg-brand-orange/10 px-4 py-3 text-sm text-brand-orange">
          {error}
        </p>
      ) : null}

      {searched && items.length === 0 ? (
        <p className="text-sm text-white/50">{labels.noResults}</p>
      ) : null}

      <ul className="space-y-3">
        {items.map((item) => {
          const redeemed = !!item.redeemedAt;
          return (
            <li
              key={`${item.kind}-${item.id}`}
              className={cn(
                "rounded-md border p-4 sm:p-5",
                redeemed
                  ? "border-brand-green/35 bg-brand-green/5"
                  : "border-brand-orange/35 bg-brand-orange/5"
              )}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={cn(
                        "px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
                        item.kind === "wheel"
                          ? "bg-brand-orange text-brand-black"
                          : "bg-brand-blue text-brand-black"
                      )}
                    >
                      {item.kind === "wheel" ? labels.kindWheel : labels.kindReward}
                    </span>
                    {redeemed ? (
                      <span className="px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider bg-brand-green text-brand-black">
                        {labels.redeemedAt}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/60">
                        {labels.pending}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.emoji}</span>
                    <div>
                      <div className="font-display text-2xl uppercase leading-tight">
                        {labelFor(item)}
                      </div>
                      <div className="mt-1 text-sm text-white/70">
                        {item.displayName}{" "}
                        <span className="text-white/45">· {item.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 font-mono text-lg tabular-nums tracking-wide text-brand-green">
                    {item.code}
                  </div>
                  <p className="mt-2 text-xs text-white/45">
                    {labels.claimedAt}: {formatWhen(item.claimedAt)}
                    {redeemed && item.redeemedAt ? (
                      <>
                        {" · "}
                        {labels.redeemedAt}: {formatWhen(item.redeemedAt)}
                        {item.redeemedByName ? ` (${item.redeemedByName})` : ""}
                      </>
                    ) : null}
                  </p>
                </div>

                {!redeemed ? (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto shrink-0"
                    disabled={redeemingCode === item.code}
                    onClick={() => redeem(item)}
                  >
                    {redeemingCode === item.code ? labels.redeeming : labels.markRedeemed}
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
