import { cookies } from "next/headers";
import Link from "next/link";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import { canCompleteStep, listJourneySteps, userCompletions } from "@/lib/data/store";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PhotoStepUploader } from "./photo-step";

export default async function JourneyPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const user = await getCurrentUser();
  const steps = listJourneySteps();
  const done = user ? new Set(userCompletions(user.id).map((c) => c.stepId)) : new Set();
  const finalStep = steps.find((s) => s.isFinal);
  const finalLocked = !!user && !!finalStep && !canCompleteStep(user.id, finalStep.id);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3x3 unites // journey</div>
      <h1 className="font-display text-5xl sm:text-6xl">
        {t.journey.title}
      </h1>
      <p className="mt-3 text-white/70 max-w-2xl">{t.journey.subtitle}</p>

      <div className="mt-8 flex items-center gap-3 text-sm font-mono uppercase tracking-wider">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-green" />
          {t.journey.stepDone}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-orange animate-pulse" />
          {t.journey.stepCurrent}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          {t.journey.stepLocked}
        </span>
      </div>

      <ol className="mt-8 relative">
        <span className="absolute left-6 sm:left-10 top-0 bottom-0 w-px bg-white/15" />
        {steps.map((step) => {
          const isDone = done.has(step.id);
          const isLockedFinal = step.isFinal && finalLocked && !isDone;
          const isAvailable = !isDone && !isLockedFinal;
          const accentBg = {
            green: "bg-brand-green",
            orange: "bg-brand-orange",
            blue: "bg-brand-blue",
          }[step.accent];
          return (
            <li key={step.id} className="relative pl-16 sm:pl-24 pb-6 last:pb-0">
              <span
                className={cn(
                  "absolute left-2 sm:left-6 top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 font-display text-sm",
                  isDone
                    ? "bg-brand-green text-brand-black border-brand-black"
                    : isLockedFinal
                    ? "bg-ink-soft text-white/40 border-white/15"
                    : `${accentBg} text-brand-black border-brand-black`
                )}
              >
                {isLockedFinal ? "🔒" : step.order}
              </span>
              <div
                className={cn(
                  "rounded-md border p-5",
                  isDone
                    ? "border-brand-green/40 bg-brand-green/5"
                    : isLockedFinal
                    ? "border-white/10 bg-white/[0.02] opacity-70"
                    : "border-brand-orange/30 bg-brand-orange/[0.04]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="brand-section-label mb-1">
                      {step.code} · {step.location[locale]}
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl">
                      {step.title[locale]}
                    </h2>
                    <p className="mt-1 text-sm text-white/70 max-w-prose">
                      {step.description[locale]}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={cn(
                        "font-display text-2xl tabular-nums",
                        isDone
                          ? "text-brand-green"
                          : isLockedFinal
                          ? "text-white/40"
                          : "text-brand-orange"
                      )}
                    >
                      +{step.points}
                    </div>
                    <div className="brand-section-label">pts</div>
                  </div>
                </div>
                {isAvailable && step.verifyMethod === "photo" && user ? (
                  <PhotoStepUploader stepId={step.id} locale={locale} dict={t} />
                ) : null}
                {isAvailable && step.verifyMethod !== "photo" ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <ButtonLink
                      href={`/scan?code=${encodeURIComponent(step.code)}`}
                      variant="orange"
                      size="sm"
                    >
                      {t.scan.title}
                    </ButtonLink>
                    <ButtonLink href="/map" variant="outline" size="sm">
                      {t.nav.map}
                    </ButtonLink>
                  </div>
                ) : null}
                {isLockedFinal ? (
                  <p className="mt-3 text-xs text-white/50 font-mono uppercase tracking-wider">
                    🔒 {t.journey.leaderHubLocked}
                  </p>
                ) : null}
                {isDone ? (
                  <div className="mt-3 inline-flex items-center gap-2 font-mono text-xs text-brand-green uppercase tracking-wider">
                    ✓ {t.journey.stepDone}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {!user ? (
        <div className="mt-8 rounded-md border border-white/10 bg-white/[0.03] p-6 text-center">
          <p className="text-white/70 mb-3">
            {locale === "nl"
              ? "Log in om je voortgang bij te houden."
              : "Log in to track your progress."}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-brand-green text-brand-black px-5 py-2 text-sm font-medium hover:bg-brand-green/90"
          >
            {t.nav.login}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
