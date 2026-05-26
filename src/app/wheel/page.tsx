import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import {
  wheelSpinsAvailable,
  wheelSpinsEarned,
  userCompletions,
  listJourneySteps,
} from "@/lib/data/store";
import { WheelClient } from "./wheel-client";

export default async function WheelPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const spins = wheelSpinsAvailable(user.id);
  const earned = wheelSpinsEarned(user.id);
  const stepsDone = userCompletions(user.id).length;
  const totalSteps = listJourneySteps().length;
  const nextSpinAt =
    stepsDone % 2 === 0
      ? stepsDone + 2
      : stepsDone + 1;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3x3 unites // wheel</div>
      <h1 className="font-display text-5xl">{t.wheel.title}</h1>
      <p className="mt-3 text-white/70">{t.wheel.subtitle}</p>
      {stepsDone < totalSteps ? (
        <p className="mt-2 text-sm text-white/50">
          {t.wheel.progress
            .replace("{done}", String(stepsDone))
            .replace("{total}", String(totalSteps))
            .replace(
              "{next}",
              String(Math.min(nextSpinAt, totalSteps))
            )}
        </p>
      ) : null}

      <WheelClient locale={locale} dict={t} spinsAvailable={spins} />

      <p className="mt-6 text-center text-xs text-white/40">
        {locale === "nl"
          ? `Totaal verdiend: ${earned} spins · Beschikbaar: ${spins}`
          : `Total earned: ${earned} spins · Available: ${spins}`}
      </p>
    </div>
  );
}
