import Link from "next/link";
import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import {
  leaderboard,
  listBadges,
  listChallenges,
  listJourneySteps,
  listRewards,
} from "@/lib/data/store";
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
  const top = leaderboard(5);
  const steps = listJourneySteps();
  const challenges = listChallenges();
  const badges = listBadges();
  const rewards = listRewards();

  return (
    <div className="flex-1">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 grid-overlay opacity-60" />
        <div className="absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-brand-orange/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-brand-green/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-16 lg:pt-24 lg:pb-20">
          <div className="brand-section-label mb-6">{t.home.eyebrow}</div>
          <h1 className="font-display text-5xl xs:text-6xl sm:text-7xl lg:text-8xl leading-[0.95] break-words">
            <span className="text-brand-white">
              {user ? t.home.titleLoggedIn1 : t.home.titleLine1}
            </span>
            <br />
            <span className="text-brand-green">
              {user ? t.home.titleLoggedIn2 : t.home.titleLine2}
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/70">
            {user ? t.home.subtitleLoggedIn : t.home.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {user ? (
              <>
                <ButtonLink href="/journey" variant="primary" size="lg">
                  {t.home.ctaPlay} →
                </ButtonLink>
                <ButtonLink href="/challenges" variant="outline" size="lg">
                  {t.home.ctaScan}
                </ButtonLink>
              </>
            ) : (
              <>
                <ButtonLink href="/login?tab=register" variant="primary" size="lg">
                  {t.home.ctaJoin} →
                </ButtonLink>
                <ButtonLink href="/login" variant="outline" size="lg">
                  {t.home.ctaLogin}
                </ButtonLink>
              </>
            )}
            <ButtonLink href="#festival-map" variant="outline" size="lg">
              {t.home.scrollToMap} ↓
            </ButtonLink>
          </div>
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat number={steps.length} label={t.home.stat1} accent="orange" />
            <Stat number={challenges.length} label={t.home.stat2} accent="green" />
            <Stat number={badges.length} label={t.home.stat3} accent="blue" />
            <Stat number={rewards.length} label={t.home.stat4} accent="green" />
          </div>
        </div>
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

function Stat({
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
    <div className="border border-white/10 rounded-md p-4 bg-white/[0.02]">
      <div className={`font-display text-5xl leading-none ${accentText}`}>
        {number}
      </div>
      <div className="mt-2 text-xs uppercase tracking-wider text-white/60">
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
