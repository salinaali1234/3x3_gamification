import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { totalCounts } from "@/lib/data/store";
import { getLeaderboard } from "@/lib/data/user-game";
import { Avatar } from "@/components/ui/avatar";
import { listUnifiedChallenges, listPrizeTiers } from "@/lib/data/challenges-v2";

export default async function AdminHome() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const counts = totalCounts();
  const top = await getLeaderboard(5);
  const challenges = listUnifiedChallenges();
  const tiers = listPrizeTiers();

  // V2 stats from in-memory store
  const v2 = (globalThis as { __3X3_V2_STORE__?: { completions: unknown[]; redemptions: unknown[] } }).__3X3_V2_STORE__;
  const totalCompletions = v2?.completions.length ?? 0;
  const totalRedemptions = v2?.redemptions.length ?? 0;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label={t.admin.kpiParticipants} value={counts.participants} accent="green" />
        <Kpi label={locale === "nl" ? "Challenges" : "Challenges"} value={challenges.length} accent="orange" />
        <Kpi label={locale === "nl" ? "Voltooid" : "Completions"} value={totalCompletions} accent="blue" />
        <Kpi label={locale === "nl" ? "Prijzen geclaimd" : "Prizes claimed"} value={totalRedemptions} accent="green" />
      </div>

      <div className="text-xs text-white/55 font-mono">
        {challenges.length} challenges · {tiers.length} prize tiers · {t.admin.kpiPhotos}: {counts.photos}
      </div>

      <section>
        <div className="brand-section-label mb-3">
          {locale === "nl" ? "Top 5 nu" : "Top 5 right now"}
        </div>
        <ul className="rounded-md border border-white/10 divide-y divide-white/5">
          {top.map((r) => (
            <li
              key={r.userId}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-display text-2xl text-brand-green w-8">
                  #{r.rank}
                </span>
                <Avatar name={r.displayName} color={r.avatarColor} size="sm" />
                <span>{r.displayName}</span>
              </div>
              <span className="font-display text-xl">{r.points}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "green" | "orange" | "blue";
}) {
  const accentText = {
    green: "text-brand-green",
    orange: "text-brand-orange",
    blue: "text-brand-blue",
  }[accent];
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.02] p-5">
      <div className="brand-section-label">{label}</div>
      <div className={`mt-2 font-display text-5xl ${accentText}`}>{value}</div>
    </div>
  );
}
