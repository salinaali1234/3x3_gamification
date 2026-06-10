import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import {
  getWheelSpinsAvailable,
  getWheelSpinsEarned,
  getWheelSpinsUsed,
  getStepCompletions,
} from "@/lib/data/user-game";
import { listJourneySteps, listWheelPrizes } from "@/lib/data/store";
import { journeyStepsUntilWheelSpin } from "@/lib/wheel/spins";
import { WheelClient } from "./wheel-client";

export default async function WheelPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const steps = listJourneySteps();
  const totalSteps = steps.length;
  const stepsDone = (await getStepCompletions(user.id)).length;
  const spins = await getWheelSpinsAvailable(user.id);
  const earned = await getWheelSpinsEarned(user.id);
  const used = await getWheelSpinsUsed(user.id);
  const remaining = journeyStepsUntilWheelSpin(stepsDone, totalSteps);
  const prizes = listWheelPrizes();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3X3 UNITES // wheel</div>
      <h1 className="font-display text-5xl">{t.wheel.title}</h1>
      <p className="mt-3 text-white/70">{t.wheel.subtitle}</p>
      {remaining > 0 ? (
        <p className="mt-2 text-sm text-white/50">
          {t.wheel.progress
            .replace("{done}", String(stepsDone))
            .replace("{total}", String(totalSteps))
            .replace("{remaining}", String(remaining))}
        </p>
      ) : (
        <p className="mt-2 text-sm text-brand-green">{t.wheel.progressComplete}</p>
      )}

      <WheelClient
        locale={locale}
        dict={t}
        spinsAvailable={spins}
        spinsEarned={earned}
        spinsUsed={used}
        stepsDone={stepsDone}
        stepsTotal={totalSteps}
        prizes={prizes}
      />

      <p className="mt-6 text-center text-xs text-white/40 font-mono tabular-nums">
        {locale === "nl"
          ? `Verdiend: ${earned} · Beschikbaar: ${spins}`
          : `Earned: ${earned} · Available: ${spins}`}
      </p>
    </div>
  );
}
