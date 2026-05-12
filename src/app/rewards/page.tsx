import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import { listRewards, totalPoints, userClaims } from "@/lib/data/store";
import { RewardsList } from "./rewards-list";

export default async function RewardsPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const user = await getCurrentUser();
  const rewards = listRewards();
  const points = user ? totalPoints(user.id) : 0;
  const claims = user ? userClaims(user.id) : [];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3x3 unites // rewards</div>
      <h1 className="font-display text-5xl sm:text-6xl">{t.rewards.title}</h1>
      <p className="mt-3 text-white/70">{t.rewards.subtitle}</p>

      <RewardsList
        rewards={rewards}
        locale={locale}
        dict={t}
        userPoints={points}
        claimedIds={claims.map((c) => c.rewardId)}
        isLoggedIn={!!user}
      />
    </div>
  );
}
