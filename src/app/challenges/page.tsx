import { Suspense } from "react";
import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import {
  listChallengesByLocation,
  listPrizeTiers,
  listUnifiedChallenges,
  userCompletedIds,
  currentFestivalDay,
} from "@/lib/data/challenges-v2";
import { getUserPointsBalance } from "@/lib/data/user-game";
import { AuthRequiredPanel } from "@/components/auth-required-panel";
import { ChallengeSchedulePopup } from "@/components/challenge-schedule-popup";

export default async function ChallengesPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const user = await getCurrentUser();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3X3 UNITES // challenges</div>
      <h1 className="font-display text-5xl sm:text-6xl">Challenges</h1>
      <p className="mt-3 text-white/70 max-w-2xl">
        Earn points by completing challenges across the festival. Some need a code
        from a 3X3 Leader on site, others you just mark as done. Spend your points on
        rewards in the prize shop.
      </p>

      {!user ? (
        <AuthRequiredPanel dict={t} />
      ) : (
        <ChallengesContent userId={user.id} />
      )}
    </div>
  );
}

async function ChallengesContent({ userId }: { userId: string }) {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const groups = listChallengesByLocation();
  const completed = Array.from(userCompletedIds(userId));
  const points = await getUserPointsBalance(userId);
  const tiers = listPrizeTiers();
  const currentDay = currentFestivalDay();

  const { ChallengesClient } = await import("./challenges-client");

  return (
    <div className="mt-10">
      <Suspense fallback={null}>
        <ChallengeSchedulePopup
          challenges={listUnifiedChallenges()}
          completedIds={completed}
          locale={locale}
          dict={t}
        />
      </Suspense>
      <ChallengesClient
        groups={groups}
        completedIds={completed}
        initialPoints={points}
        tiers={tiers}
        currentDay={currentDay}
      />
    </div>
  );
}
