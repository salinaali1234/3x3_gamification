import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import {
  getLeaderboard,
  getTotalPoints,
  getUserAttempts,
  getUserBadges,
  getUserMatchSubmissions,
  listLiveMatches,
} from "@/lib/data/user-game";
import { listUnifiedChallenges, userCompletedIds } from "@/lib/data/challenges-v2";
import { getChallengeById, listChallenges } from "@/lib/data/store";
import { ButtonLink } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import { BadgeSticker } from "@/components/ui/badge-sticker";
import { Avatar } from "@/components/ui/avatar";
import { MatchScorePopup } from "@/components/match-score-popup";
import { ChallengeSchedulePopup } from "@/components/challenge-schedule-popup";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const challenges = listChallenges();
  const points = await getTotalPoints(user.id);
  const badges = await getUserBadges(user.id);
  const attempts = await getUserAttempts(user.id);
  const doneChallengeIds = new Set(attempts.map((a) => a.challengeId));
  const challengesDone = challenges.filter((c) => doneChallengeIds.has(c.id)).length;
  const recommendedChallenge = challenges.find(
    (c) => !doneChallengeIds.has(c.id)
  );
  const lb = await getLeaderboard(100);
  const myRank = lb.findIndex((r) => r.userId === user.id);
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
      <Suspense fallback={null}>
        <ChallengeSchedulePopup
          challenges={listUnifiedChallenges()}
          completedIds={Array.from(userCompletedIds(user.id))}
          locale={locale}
          dict={t}
        />
      </Suspense>
      <div className="brand-section-label mb-2">
        3X3 UNITES // dashboard
      </div>
      <h1 className="font-display text-5xl sm:text-6xl">
        Yo,{" "}
        <span className="text-brand-green">{user.displayName.split(" ")[0]}</span>.
      </h1>
      <p className="mt-2 text-white/70">
        {locale === "nl"
          ? "Klaar voor je volgende challenge?"
          : "Ready for your next challenge?"}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Tile
          label={t.common.yourPoints}
          value={points}
          accent="green"
        />
        <Tile
          label={locale === "nl" ? "Challenges voltooid" : "Challenges done"}
          value={`${challengesDone}/${challenges.length}`}
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
          {locale === "nl" ? "Volgende challenge" : "Next challenge"}
        </SectionLabel>
        {recommendedChallenge ? (
          <div className="rounded-md border border-brand-orange/40 bg-brand-orange/5 p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div>
              <div className="brand-section-label !text-brand-orange mb-1">
                {t.challenges.types[recommendedChallenge.type]}
              </div>
              <h2 className="font-display text-3xl">
                {recommendedChallenge.title[locale]}
              </h2>
              <p className="text-sm text-white/60 mt-2 max-w-prose">
                {recommendedChallenge.description[locale]}
              </p>
              <div className="mt-3 font-display text-2xl text-brand-green">
                +{recommendedChallenge.points} pts
              </div>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
              <ButtonLink
                href={`/challenges/${recommendedChallenge.id}`}
                variant="orange"
                className="w-full sm:w-auto"
              >
                {t.common.next} →
              </ButtonLink>
              <ButtonLink href="/challenges" variant="outline" className="w-full sm:w-auto">
                {t.nav.challenges}
              </ButtonLink>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-brand-green/40 bg-brand-green/5 p-6">
            <h2 className="font-display text-3xl text-brand-green">
              {locale === "nl" ? "Alle challenges voltooid!" : "All challenges complete!"}
            </h2>
            <p className="text-white/70 mt-2">
              {locale === "nl"
                ? "Pak je rewards op via je Street Pass."
                : "Claim your rewards via your Street Pass."}
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
            {t.profile.yourBadges}
          </SectionLabel>
          {badges.length === 0 ? (
            <div className="rounded-md border border-white/10 bg-white/[0.02] p-6 text-white/60">
              {locale === "nl"
                ? "Nog geen badges. Voltooi je eerste challenge om badges te verdienen."
                : "No badges yet. Complete your first challenge to earn badges."}
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 rounded-md border border-white/10 bg-white/[0.02] p-6">
              {badges.map((b) =>
                b ? (
                  <BadgeSticker key={b.id} badge={b} locale={locale} size="md" />
                ) : null
              )}
            </div>
          )}
        </div>

        <div>
          <SectionLabel number="03" className="mb-4">
            {locale === "nl" ? "Code invoeren" : "Enter a code"}
          </SectionLabel>
          <div className="rounded-md border border-white/10 bg-white/[0.02] p-6">
            <p className="text-sm text-white/70">
              {locale === "nl"
                ? "Scan of typ een locatiecode op de challenges-pagina."
                : "Scan or type a location code on the challenges page."}
            </p>
            <ButtonLink href="/challenges" variant="primary" className="mt-4 w-full sm:w-auto">
              {t.challenges.enterCode}
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <SectionLabel number="04" className="mb-4">
          {locale === "nl" ? "Recente activiteit" : "Recent activity"}
        </SectionLabel>
        <ul className="rounded-md border border-white/10 divide-y divide-white/5">
          {attempts
            .slice()
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .slice(0, 6)
            .map((row) => {
              const ch = getChallengeById(row.challengeId);
              return (
                <li
                  key={row.id}
                  className="flex items-center gap-3 px-4 py-3 text-sm"
                >
                  <Avatar
                    name={user.displayName}
                    color={user.avatarColor}
                    size="sm"
                  />
                  <span className="flex-1 truncate">
                    {ch ? (
                      <>
                        <span className="text-white/60">
                          {locale === "nl" ? "Challenge:" : "Challenge:"}{" "}
                        </span>
                        <span className="text-brand-white">{ch.title[locale]}</span>
                      </>
                    ) : null}
                  </span>
                  <span className="font-mono text-xs text-white/40">
                    {new Date(row.createdAt).toLocaleString(locale)}
                  </span>
                </li>
              );
            })}
          {attempts.length === 0 ? (
            <li className="px-4 py-6 text-sm text-white/50">
              {t.common.noResults}
            </li>
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
      <div className={`font-display text-5xl mt-3 tabular-nums tracking-wide leading-tight py-0.5 ${colors.split(" ")[1]}`}>
        {value}
      </div>
      {mono ? (
        <div className="mt-1 text-xs text-white/40 font-mono">{mono}</div>
      ) : null}
    </div>
  );
}
