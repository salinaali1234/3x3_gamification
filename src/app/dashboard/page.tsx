import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import {
  leaderboard,
  listJourneySteps,
  listLiveMatches,
  totalPoints,
  wheelSpinsAvailable,
  userAttempts,
  userBadgesFor,
  userCompletions,
  userMatchSubmissions,
  getBadgeById,
  getChallengeById,
  listChallenges,
} from "@/lib/data/store";
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

  const steps = listJourneySteps();
  const completions = userCompletions(user.id);
  const completedIds = new Set(completions.map((c) => c.stepId));
  const nextStep = steps.find((s) => !completedIds.has(s.id));
  const points = totalPoints(user.id);
  const spins = wheelSpinsAvailable(user.id);
  const badges = userBadgesFor(user.id)
    .map((ub) => getBadgeById(ub.badgeId))
    .filter(Boolean);
  const attempts = userAttempts(user.id);
  const doneChallengeIds = new Set(attempts.map((a) => a.challengeId));
  const recommendedChallenge = listChallenges().find(
    (c) => !doneChallengeIds.has(c.id)
  );
  const lb = leaderboard(100);
  const myRank = lb.findIndex((r) => r.userId === user.id);
  const liveMatches = listLiveMatches();
  const matchDoneIds = userMatchSubmissions(user.id).map((s) => s.matchId);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <MatchScorePopup
        matches={liveMatches}
        alreadyDone={matchDoneIds}
        locale={locale}
        dict={t}
      />
      <div className="brand-section-label mb-2">
        3x3 unites // dashboard
      </div>
      <h1 className="font-display text-5xl sm:text-6xl">
        Yo,{" "}
        <span className="text-brand-green">{user.displayName.split(" ")[0]}</span>.
      </h1>
      <p className="mt-2 text-white/70">
        {locale === "nl"
          ? "Klaar voor de volgende stap?"
          : "Ready for your next step?"}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          label={locale === "nl" ? "Wheel spins" : "Wheel spins"}
          value={spins}
          accent="orange"
        />
        <Tile
          label={t.common.yourPoints}
          value={points}
          accent="green"
        />
        <Tile
          label={locale === "nl" ? "Stappen voltooid" : "Steps completed"}
          value={`${completions.length}/${steps.length}`}
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
          {locale === "nl" ? "Volgende stap" : "Next step"}
        </SectionLabel>
        {nextStep ? (
          <div className="rounded-md border border-brand-orange/40 bg-brand-orange/5 p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div>
              <div className="brand-section-label !text-brand-orange mb-1">
                STEP {nextStep.order} / {steps.length}
              </div>
              <h2 className="font-display text-3xl">{nextStep.title[locale]}</h2>
              <p className="text-white/70 mt-1">{nextStep.location[locale]}</p>
              <p className="text-sm text-white/60 mt-2 max-w-prose">
                {nextStep.description[locale]}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <span className="font-display text-3xl text-brand-orange">🎡 spin</span>
              <div className="flex flex-wrap gap-2">
                <ButtonLink href="/scan" variant="orange">
                  {t.scan.title}
                </ButtonLink>
                <ButtonLink href="/wheel" variant="outline">
                  {t.nav.wheel}
                </ButtonLink>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-brand-green/40 bg-brand-green/5 p-6">
            <h2 className="font-display text-3xl text-brand-green">
              {locale === "nl" ? "Hele journey voltooid!" : "Whole journey complete!"}
            </h2>
            <p className="text-white/70 mt-2">
              {locale === "nl"
                ? "Bekijk je rewards of pak nog wat extra punten via challenges."
                : "Go cash in your rewards or grab extra points via challenges."}
            </p>
            <div className="mt-4 flex gap-3">
              <ButtonLink href="/rewards" variant="primary">
                {t.nav.rewards}
              </ButtonLink>
              <ButtonLink href="/challenges" variant="outline">
                {t.nav.challenges}
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
                ? "Nog geen badges. Voltooi je eerste stap om de 'First step' badge te verdienen."
                : "No badges yet. Complete your first step to earn the 'First step' badge."}
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
            {locale === "nl" ? "Aanbevolen challenge" : "Recommended challenge"}
          </SectionLabel>
          {recommendedChallenge ? (
            <Link
              href={`/challenges/${recommendedChallenge.id}`}
              className="block rounded-md border border-white/10 bg-white/[0.02] p-6 hover:border-brand-green/60 hover:bg-white/[0.04] transition-colors"
            >
              <div className="brand-section-label !text-brand-green mb-1">
                {t.challenges.types[recommendedChallenge.type]}
              </div>
              <h3 className="font-display text-2xl">
                {recommendedChallenge.title[locale]}
              </h3>
              <p className="text-sm text-white/70 mt-1">
                {recommendedChallenge.description[locale]}
              </p>
              <div className="mt-3 font-display text-2xl text-brand-green">
                +{recommendedChallenge.points} pts →
              </div>
            </Link>
          ) : (
            <div className="rounded-md border border-white/10 bg-white/[0.02] p-6 text-white/60">
              {locale === "nl" ? "Alle challenges gedaan!" : "All challenges done!"}
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <SectionLabel number="04" className="mb-4">
          {locale === "nl" ? "Recente activiteit" : "Recent activity"}
        </SectionLabel>
        <ul className="rounded-md border border-white/10 divide-y divide-white/5">
          {(() => {
            type ActivityRow = {
              kind: "step" | "attempt";
              userId: string;
              stepId: string;
              completedAt: string;
            };
            const stepRows: ActivityRow[] = completions.map((c) => ({
              kind: "step",
              userId: c.userId,
              stepId: c.stepId,
              completedAt: c.completedAt,
            }));
            const attemptRows: ActivityRow[] = attempts.map((a) => ({
              kind: "attempt",
              userId: a.userId,
              stepId: a.challengeId,
              completedAt: a.createdAt,
            }));
            return [...stepRows, ...attemptRows];
          })()
            .sort(
              (a, b) =>
                new Date(b.completedAt).getTime() -
                new Date(a.completedAt).getTime()
            )
            .slice(0, 6)
            .map((row, i) => {
              const isStep = row.kind === "step";
              const step = isStep ? steps.find((s) => s.id === row.stepId) : null;
              const ch = !isStep ? getChallengeById(row.stepId) : null;
              return (
                <li
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 text-sm"
                >
                  <Avatar
                    name={user.displayName}
                    color={user.avatarColor}
                    size="sm"
                  />
                  <span className="flex-1 truncate">
                    {isStep && step ? (
                      <>
                        <span className="text-white/60">
                          {locale === "nl" ? "Voltooid:" : "Completed:"}{" "}
                        </span>
                        <span className="text-brand-white">{step.title[locale]}</span>
                      </>
                    ) : ch ? (
                      <>
                        <span className="text-white/60">
                          {locale === "nl" ? "Challenge:" : "Challenge:"}{" "}
                        </span>
                        <span className="text-brand-white">{ch.title[locale]}</span>
                      </>
                    ) : null}
                  </span>
                  <span className="font-mono text-xs text-white/40">
                    {new Date(row.completedAt).toLocaleString(locale)}
                  </span>
                </li>
              );
            })}
          {completions.length === 0 && attempts.length === 0 ? (
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
    <div className={`rounded-md border ${colors} bg-white/[0.02] p-5`}>
      <div className="brand-section-label">{label}</div>
      <div className={`font-display text-5xl mt-2 ${colors.split(" ")[1]}`}>
        {value}
      </div>
      {mono ? (
        <div className="mt-1 text-xs text-white/40 font-mono">{mono}</div>
      ) : null}
    </div>
  );
}
