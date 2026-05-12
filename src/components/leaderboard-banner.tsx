import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { getBadgeById } from "@/lib/data/store";
import type { LeaderboardRow } from "@/lib/data/store";
import type { Locale } from "@/lib/i18n/config";

export function LeaderboardBanner({
  rows,
  locale,
  variant = "ticker",
}: {
  rows: LeaderboardRow[];
  locale: Locale;
  variant?: "featured" | "ticker";
}) {
  if (variant === "ticker") {
    const doubled = [...rows, ...rows];
    return (
      <div className="overflow-hidden border-y border-white/10">
        <div className="flex gap-8 py-3 animate-ticker whitespace-nowrap">
          {doubled.map((r, i) => (
            <div key={`${r.userId}-${i}`} className="flex items-center gap-3 px-4">
              <span className="font-display text-xl text-brand-green">#{r.rank}</span>
              <Avatar name={r.displayName} color={r.avatarColor} size="sm" />
              <span className="text-sm text-white/80">{r.displayName}</span>
              <span className="font-mono text-xs text-white/50">{r.points} pts</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-5">
      {rows.map((r) => (
        <Link
          key={r.userId}
          href="/leaderboard"
          className="group relative overflow-hidden rounded-md border border-white/10 bg-white/[0.03] p-4 hover:border-brand-green/60 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-3xl text-brand-green leading-none">
              #{r.rank}
            </span>
            <Avatar name={r.displayName} color={r.avatarColor} size="md" />
          </div>
          <div className="font-medium truncate">{r.displayName}</div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-2xl tabular-nums">{r.points}</span>
            <span className="brand-section-label !text-white/40">pts</span>
          </div>
          <div className="mt-2 flex gap-1">
            {r.badgeIds.slice(0, 3).map((bid) => {
              const b = getBadgeById(bid);
              if (!b) return null;
              return (
                <span
                  key={bid}
                  className="text-lg"
                  title={b.name[locale]}
                  aria-label={b.name[locale]}
                >
                  {b.emoji}
                </span>
              );
            })}
          </div>
        </Link>
      ))}
    </div>
  );
}
