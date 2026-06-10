import Link from "next/link";
import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import {
  listBadges,
  listChallenges,
  listJourneySteps,
  listRewards,
} from "@/lib/data/store";
import { getLeaderboard } from "@/lib/data/user-game";
import { ButtonLink } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/section-label";
import { LeaderboardBanner } from "@/components/leaderboard-banner";
import { BadgeTicker } from "@/components/badge-ticker";
import { HomeMapPreview } from "@/components/home-map-preview";
import { FestivalWelcomeIntro } from "@/components/festival-welcome-intro";

export default async function HomePage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const user = await getCurrentUser();
  const top = await getLeaderboard(5);
  const steps = listJourneySteps();
  const challenges = listChallenges();
  const badges = listBadges();
  const rewards = listRewards();

  return (
    <div className="flex-1">
      {/* Festival poster hero */}
      <section className="relative overflow-hidden border-b border-white/10 bg-brand-black">
        <div className="absolute inset-0 fence-pattern opacity-50 pointer-events-none" />
        <div
          className="absolute -right-20 top-0 h-72 w-72 bg-brand-green/10 blur-3xl pointer-events-none"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-0 lg:pt-16">
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="bg-brand-green px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-brand-black">
              3X3 UNITES
            </span>
            <span className="font-mono text-[11px] uppercase tracking-widest text-white/50">
              {t.home.festivalDates} · {t.home.festivalLocation}
            </span>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
            <div>
              <h1 className="font-display uppercase leading-[0.82] tracking-tight">
                <span className="block text-[clamp(4rem,16vw,11rem)] text-brand-white">
                  {t.home.posterLine1}
                </span>
                <span className="block text-[clamp(4rem,16vw,11rem)] text-brand-green">
                  {t.home.posterLine2}
                </span>
                <span className="block text-[clamp(3rem,12vw,8rem)] text-brand-white">
                  {t.home.posterLine3}
                </span>
              </h1>

              <p className="mt-6 max-w-xl font-mono text-xs sm:text-sm uppercase tracking-widest text-white/55">
                {t.home.festivalSeries}
              </p>

              <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/70">
                {user ? t.home.subtitleLoggedIn : t.home.subtitle}
              </p>

              <p className="mt-3 font-display text-2xl sm:text-3xl uppercase text-brand-orange leading-none">
                {user ? (
                  <>
                    {t.home.titleLoggedIn1}{" "}
                    <span className="text-brand-green">{t.home.titleLoggedIn2}</span>
                  </>
                ) : (
                  <>
                    {t.home.titleLine1}{" "}
                    <span className="text-brand-green">{t.home.titleLine2}</span>
                  </>
                )}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3">
                {user ? (
                  <>
                    <ButtonLink href="/journey" variant="primary" size="lg" className="w-full sm:w-auto">
                      {t.home.ctaPlay} →
                    </ButtonLink>
                    <ButtonLink href="/challenges" variant="outline" size="lg" className="w-full sm:w-auto">
                      {t.home.ctaScan}
                    </ButtonLink>
                  </>
                ) : (
                  <>
                    <ButtonLink href="/login?tab=register" variant="primary" size="lg" className="w-full sm:w-auto">
                      {t.home.ctaJoin} →
                    </ButtonLink>
                    <ButtonLink href="/login" variant="outline" size="lg" className="w-full sm:w-auto">
                      {t.home.ctaLogin}
                    </ButtonLink>
                  </>
                )}
                <ButtonLink href="#festival-map" variant="outline" size="lg" className="w-full sm:w-auto">
                  {t.home.scrollToMap} ↓
                </ButtonLink>
              </div>
            </div>

            <div className="hidden lg:flex flex-col gap-3 pb-8 min-w-[200px]">
              <PosterSideBlock label={t.home.festivalDates} accent />
              <PosterSideBlock label={t.home.festivalLocation} />
              <PosterSideBlock label={t.home.jubilee} small />
            </div>
          </div>

          {/* PLAY · UNITE · EMPOWER */}
          <div className="mt-10 grid grid-cols-3 border border-white/15">
            <Pillar label={t.home.pillarPlay} accent="green" />
            <Pillar label={t.home.pillarUnite} accent="orange" />
            <Pillar label={t.home.pillarEmpower} accent="blue" />
          </div>

          <p className="mt-6 font-display text-xl sm:text-2xl uppercase tracking-wide text-white/80">
            {t.home.posterRaw}
          </p>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 border border-white/10">
            <PosterStat number={steps.length} label={t.home.stat1} accent="orange" />
            <PosterStat number={challenges.length} label={t.home.stat2} accent="green" />
            <PosterStat number={badges.length} label={t.home.stat3} accent="blue" />
            <PosterStat number={rewards.length} label={t.home.stat4} accent="green" />
          </div>
        </div>

        <div className="mt-10 h-1.5 w-full bg-gradient-to-r from-brand-green via-brand-orange to-brand-blue" />
      </section>

      <section className="border-b border-white/10 bg-brand-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <SectionLabel number="01" className="mb-8">
            {t.home.sectionWelcome}
          </SectionLabel>
          <FestivalWelcomeIntro dict={t} />
        </div>
      </section>

      <div className="relative border-b border-white/10 bg-brand-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center text-center">
          <p className="text-sm sm:text-base text-white/60 font-mono uppercase tracking-wider">
            {t.home.mapBelow}
          </p>
          <a
            href="#festival-map"
            aria-label={t.home.scrollToMap}
            className="mt-3 inline-flex flex-col items-center text-brand-green hover:text-brand-white transition-colors"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-bounce"
              aria-hidden="true"
            >
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          </a>
        </div>
      </div>

      <HomeMapPreview locale={locale} dict={t} />

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <SectionLabel number="02" className="mb-6">
            {t.home.sectionLeaderboard}
          </SectionLabel>
          <LeaderboardBanner rows={top} locale={locale} variant="featured" />
          <div className="mt-4 flex justify-end">
            <Link
              href="/leaderboard"
              className="text-sm text-white/60 hover:text-brand-green font-mono uppercase tracking-wider"
            >
              {t.common.seeAll} →
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-brand-offwhite text-brand-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center gap-3 brand-section-label !text-brand-black/60 mb-6">
            <span className="text-brand-black/40">03</span>
            <span>{t.home.sectionLatestBadges}</span>
            <span className="h-px flex-1 bg-brand-black/15" />
          </div>
          <BadgeTicker badges={badges} locale={locale} />
        </div>
      </section>

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <SectionLabel number="04" className="mb-8">
            {t.home.sectionHowItWorks}
          </SectionLabel>
          <div className="grid gap-4 md:grid-cols-3">
            <HowItWorksCard
              n="01"
              title={t.home.hiwStep1Title}
              body={t.home.hiwStep1Body}
              accent="green"
            />
            <HowItWorksCard
              n="02"
              title={t.home.hiwStep2Title}
              body={t.home.hiwStep2Body}
              accent="orange"
            />
            <HowItWorksCard
              n="03"
              title={t.home.hiwStep3Title}
              body={t.home.hiwStep3Body}
              accent="blue"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function PosterSideBlock({
  label,
  accent,
  small,
}: {
  label: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={`border px-4 py-3 ${
        accent ? "border-brand-green/40 bg-brand-green/10" : "border-white/12 bg-white/[0.03]"
      }`}
    >
      <p
        className={`font-mono uppercase tracking-widest leading-snug ${
          small ? "text-[10px] text-white/50" : "text-xs text-white/70"
        } ${accent ? "text-brand-green" : ""}`}
      >
        {label}
      </p>
    </div>
  );
}

function Pillar({
  label,
  accent,
}: {
  label: string;
  accent: "green" | "orange" | "blue";
}) {
  const colors = {
    green: "bg-brand-green text-brand-black",
    orange: "bg-brand-orange text-brand-black",
    blue: "bg-brand-blue text-brand-black",
  };
  return (
    <div
      className={`py-3 px-1 text-center font-display text-base sm:text-xl md:text-2xl uppercase tracking-wide sm:tracking-wider ${colors[accent]}`}
    >
      {label}
    </div>
  );
}

function PosterStat({
  number,
  label,
  accent,
}: {
  number: number;
  label: string;
  accent: "green" | "orange" | "blue";
}) {
  const accentText = {
    green: "text-brand-green",
    orange: "text-brand-orange",
    blue: "text-brand-blue",
  }[accent];
  return (
    <div className="bg-brand-black px-4 py-5 sm:py-6">
      <div className={`font-display text-4xl sm:text-5xl leading-none tabular-nums ${accentText}`}>
        {number}
      </div>
      <div className="mt-2 font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-white/50">
        {label}
      </div>
    </div>
  );
}

function HowItWorksCard({
  n,
  title,
  body,
  accent,
}: {
  n: string;
  title: string;
  body: string;
  accent: "green" | "orange" | "blue";
}) {
  const accentBg = {
    green: "bg-brand-green",
    orange: "bg-brand-orange",
    blue: "bg-brand-blue",
  }[accent];
  return (
    <div className="relative rounded-md border border-white/10 bg-white/[0.02] p-6 hover:border-white/20 transition-colors">
      <div
        className={`absolute -top-3 left-6 px-2 py-0.5 ${accentBg} text-brand-black font-mono text-xs uppercase tracking-widest`}
      >
        {n}
      </div>
      <h3 className="font-display text-2xl mt-2">{title}</h3>
      <p className="mt-2 text-sm text-white/70">{body}</p>
    </div>
  );
}
