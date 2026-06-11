import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import {
  getLeaderboard,
  getChallengePassPoints,
  getUserBadges,
  getUserMatchSubmissions,
  listLiveMatches,
} from "@/lib/data/user-game";
import {
  listUnifiedChallenges,
  userCompletedIds,
  userCompletions,
  userPointsEarned,
  userPointsSpent,
  currentFestivalDay,
  isChallengeAvailable,
  listPrizeTiers,
  userRedemptions,
} from "@/lib/data/challenges-v2";
import { ButtonLink } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import { BadgeSticker } from "@/components/ui/badge-sticker";
import { Avatar } from "@/components/ui/avatar";
import { MatchScorePopup } from "@/components/match-score-popup";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const today = currentFestivalDay();
  const allChallenges = listUnifiedChallenges();
  const completedIds = userCompletedIds(user.id);
  const completions = userCompletions(user.id);
  const balance = await getChallengePassPoints(user.id);
  const earned = userPointsEarned(user.id);
  const spent = userPointsSpent(user.id);
  const badges = await getUserBadges(user.id);
  const lb = await getLeaderboard(100);
  const myRank = lb.findIndex((r) => r.userId === user.id);

  const tiers = listPrizeTiers();
  const redemptions = userRedemptions(user.id);
  const nextTier = tiers.find((t) => t.costPoints > balance) ?? null;

  const recommendedChallenge =
    allChallenges.find(
      (c) => !completedIds.has(c.id) && isChallengeAvailable(c, today === "sunday" ? undefined : today ?? undefined)
    ) ?? allChallenges.find((c) => !completedIds.has(c.id));

  const liveMatches = await listLiveMatches();
  const matchDoneIds = (await getUserMatchSubmissions(user.id)).map((s) => s.matchId);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <MatchScorePopup
        matches={liveMatches}
        alreadyDone={matchDoneIds}
        locale={locale}
        dict={t}
      />
      <div className="brand-section-label mb-2">3X3 UNITES // dashboard</div>
      <h1 className="font-display text-5xl sm:text-6xl">
        Yo,{" "}
        <span className="text-brand-green">{user.displayName.split(" ")[0]}</span>.
      </h1>
      <p className="mt-2 text-white/70">
        {locale === "nl"
          ? "Klaar voor de volgende challenge?"
          : "Ready for your next challenge?"}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label={t.common.yourPoints} value={balance} accent="green" />
        <Tile
          label={locale === "nl" ? "Verdiend" : "Earned"}
          value={earned}
          mono={spent > 0 ? `-${spent} ${locale === "nl" ? "uitgegeven" : "spent"}` : undefined}
          accent="orange"
        />
        <Tile
          label={locale === "nl" ? "Challenges gedaan" : "Challenges done"}
          value={`${completions.length}/${allChallenges.length}`}
          accent="orange"
        />
        <Tile
          label={t.common.yourRank}
          value={myRank >= 0 ? `#${myRank + 1}` : "—"}
          accent="blue"
        />
      </div>

      <section className="mt-10">
        <SectionLabel number="01" className="mb-4">
          {locale === "nl" ? "Aanbevolen challenge" : "Recommended challenge"}
        </SectionLabel>
        {recommendedChallenge ? (
          <div className="rounded-md border border-brand-orange/40 bg-brand-orange/5 p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div>
              <div className="brand-section-label !text-brand-orange mb-1">
                {recommendedChallenge.location}
              </div>
              <h2 className="font-display text-3xl">{recommendedChallenge.title}</h2>
              <p className="text-base text-white/75 mt-1">{recommendedChallenge.subtitle}</p>
              <p className="text-sm text-white/55 mt-2 max-w-prose">
                {recommendedChallenge.description}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <span className="font-display text-3xl text-brand-orange">
                +{recommendedChallenge.points} pts
              </span>
              <ButtonLink href="/challenges" variant="orange" className="w-full sm:w-auto">
                {locale === "nl" ? "Naar challenges" : "Go to challenges"}
              </ButtonLink>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-brand-green/40 bg-brand-green/5 p-6">
            <h2 className="font-display text-3xl text-brand-green">
              {locale === "nl"
                ? "Alle challenges voltooid!"
                : "All challenges complete!"}
            </h2>
            <p className="text-white/70 mt-2">
              {locale === "nl"
                ? "Tijd om je punten in te wisselen voor een reward."
                : "Time to spend your points on a reward."}
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <ButtonLink href="/rewards" variant="primary" className="w-full sm:w-auto">
                {t.nav.rewards}
              </ButtonLink>
            </div>
          </div>
        )}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <SectionLabel number="02" className="mb-4">
            {locale === "nl" ? "Volgende prijs" : "Next prize tier"}
          </SectionLabel>
          {nextTier ? (
            <Link
              href="/rewards"
              className="block rounded-md border border-white/10 bg-white/[0.02] p-6 hover:border-brand-green/60 transition-colors"
            >
              <div className="text-3xl mb-2">{nextTier.emoji}</div>
              <h3 className="font-display text-2xl">{nextTier.name}</h3>
              <p className="text-sm text-white/60 mt-1">{nextTier.description}</p>
              <div className="mt-3 font-display text-2xl text-brand-green">
                {nextTier.costPoints} pts ·{" "}
                <span className="text-brand-orange">
                  {locale === "nl" ? "nog" : "need"} {nextTier.costPoints - balance}
                </span>
              </div>
            </Link>
          ) : (
            <div className="rounded-md border border-brand-green/40 bg-brand-green/5 p-6 text-brand-green">
              {locale === "nl"
                ? "Je hebt het hoogste tier ontgrendeld!"
                : "You've unlocked the top tier!"}
            </div>
          )}
        </div>

        <div>
          <SectionLabel number="03" className="mb-4">
            {t.profile.yourBadges}
          </SectionLabel>
          {badges.length === 0 ? (
            <div className="rounded-md border border-white/10 bg-white/[0.02] p-6 text-white/60">
              {locale === "nl"
                ? "Nog geen badges. Voltooi je eerste challenge om er een te verdienen."
                : "No badges yet. Complete your first challenge to earn one."}
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 rounded-md border border-white/10 bg-white/[0.02] p-6">
              {badges.map((b) =>
                b ? <BadgeSticker key={b.id} badge={b} locale={locale} size="md" /> : null
              )}
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <SectionLabel number="04" className="mb-4">
          {locale === "nl" ? "Recente activiteit" : "Recent activity"}
        </SectionLabel>
        <ul className="rounded-md border border-white/10 divide-y divide-white/5">
          {[...completions, ...redemptions.map((r) => ({ ...r, isRedemption: true as const }))]
            .sort((a, b) => {
              const aTime = "completedAt" in a ? a.completedAt : (a as { claimedAt: string }).claimedAt;
              const bTime = "completedAt" in b ? b.completedAt : (b as { claimedAt: string }).claimedAt;
              return new Date(bTime).getTime() - new Date(aTime).getTime();
            })
            .slice(0, 6)
            .map((row, i) => {
              if ("challengeId" in row) {
                const c = allChallenges.find((x) => x.id === row.challengeId);
                return (
                  <li key={i} className="flex items-center gap-3 px-4 py-3 text-sm">
                    <Avatar name={user.displayName} color={user.avatarColor} size="sm" />
                    <span className="flex-1 truncate">
                      <span className="text-white/60">
                        {locale === "nl" ? "Voltooid:" : "Completed:"}{" "}
                      </span>
                      <span className="text-brand-white">{c?.title ?? row.challengeId}</span>
                    </span>
                    <span className="text-brand-green font-mono text-xs">+{row.pointsAwarded}</span>
                    <span className="font-mono text-xs text-white/40">
                      {new Date(row.completedAt).toLocaleString(locale)}
                    </span>
                  </li>
                );
              }
              const r = row as { tierId: string; costPoints: number; claimedAt: string; voucherCode: string };
              const tier = tiers.find((t) => t.id === r.tierId);
              return (
                <li key={i} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <span className="text-2xl">{tier?.emoji ?? "🎁"}</span>
                  <span className="flex-1 truncate">
                    <span className="text-white/60">
                      {locale === "nl" ? "Geclaimd:" : "Redeemed:"}{" "}
                    </span>
                    <span className="text-brand-white">{tier?.name ?? r.tierId}</span>
                  </span>
                  <span className="text-brand-orange font-mono text-xs">-{r.costPoints}</span>
                  <span className="font-mono text-xs text-white/40">
                    {new Date(r.claimedAt).toLocaleString(locale)}
                  </span>
                </li>
              );
            })}
          {completions.length === 0 && redemptions.length === 0 ? (
            <li className="px-4 py-6 text-sm text-white/50">{t.common.noResults}</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}

function Tile({
  label,
  value,
  accent,
  mono,
}: {
  label: string;
  value: string | number;
  accent: "green" | "orange" | "blue";
  mono?: string;
}) {
  const colors = {
    green: "border-brand-green/40 text-brand-green",
    orange: "border-brand-orange/40 text-brand-orange",
    blue: "border-brand-blue/40 text-brand-blue",
  }[accent];
  return (
    <div className={`rounded-md border ${colors} bg-white/[0.02] p-5 sm:p-6`}>
      <div className="brand-section-label">{label}</div>
      <div
        className={`font-display text-5xl mt-3 tabular-nums tracking-wide leading-tight py-0.5 ${colors.split(" ")[1]}`}
      >
        {value}
      </div>
      {mono ? <div className="mt-1 text-xs text-white/40 font-mono">{mono}</div> : null}
    </div>
  );
}
