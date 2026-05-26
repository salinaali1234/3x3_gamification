import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import { leaderboard, getBadgeById } from "@/lib/data/store";
import { Avatar } from "@/components/ui/avatar";

export default async function LeaderboardPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const user = await getCurrentUser();
  const rows = leaderboard(100);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3x3 unites // leaderboard</div>
      <h1 className="font-display text-5xl sm:text-6xl">{t.leaderboard.title}</h1>
      <p className="mt-3 text-white/70">{t.leaderboard.subtitle}</p>

      <div className="mt-8 rounded-md border border-white/10 overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead className="bg-white/[0.04]">
            <tr className="text-left text-xs uppercase tracking-wider text-white/50">
              <th className="px-4 py-3 w-12">{t.leaderboard.colRank}</th>
              <th className="px-4 py-3">{t.leaderboard.colPlayer}</th>
              <th className="px-4 py-3 hidden sm:table-cell">{t.leaderboard.colBadges}</th>
              <th className="px-4 py-3 text-right">{t.leaderboard.colPoints}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((r) => {
              const isMe = user?.id === r.userId;
              return (
                <tr
                  key={r.userId}
                  className={
                    isMe
                      ? "bg-brand-green/10"
                      : r.rank <= 3
                      ? "bg-white/[0.02]"
                      : ""
                  }
                >
                  <td className="px-4 py-3 font-display text-2xl">
                    {r.rank <= 3 ? (
                      <span
                        className={
                          r.rank === 1
                            ? "text-brand-green"
                            : r.rank === 2
                            ? "text-brand-orange"
                            : "text-brand-blue"
                        }
                      >
                        #{r.rank}
                      </span>
                    ) : (
                      <span className="text-white/40">#{r.rank}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.displayName} color={r.avatarColor} size="sm" />
                      <span>
                        {r.displayName}
                        {isMe ? (
                          <span className="ml-2 text-xs font-mono text-brand-green uppercase tracking-wider">
                            you
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {r.badgeIds.slice(0, 4).map((bid) => {
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
                  </td>
                  <td className="px-4 py-3 text-right font-display text-xl tabular-nums">
                    {r.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
