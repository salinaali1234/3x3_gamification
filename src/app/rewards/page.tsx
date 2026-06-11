import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import { listRewardsWithStock, getUserClaims } from "@/lib/data/user-game";
import { userPointsBalance } from "@/lib/data/challenges-v2";
import { RewardsList } from "./rewards-list";
import { AuthRequiredPanel } from "@/components/auth-required-panel";

export default async function RewardsPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="brand-section-label mb-2">3X3 UNITES // street pass</div>
        <p className="max-w-2xl text-white/70">{t.rewards.subtitle}</p>
        <AuthRequiredPanel dict={t} />
      </div>
    );
  }

  const rewards = await listRewardsWithStock();
  const points = userPointsBalance(user.id);
  const claims = await getUserClaims(user.id);
  const claimVouchers = Object.fromEntries(
    claims.filter((c) => c.voucherCode).map((c) => [c.rewardId, c.voucherCode])
  );
  const claimRedeemed = Object.fromEntries(
    claims.map((c) => [c.rewardId, c.redeemedAt ?? null])
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3X3 UNITES // street pass</div>
      <p className="max-w-2xl text-white/70">{t.rewards.subtitle}</p>
      <p className="mt-2 max-w-2xl text-sm text-white/45">{t.rewards.pointsTierHint}</p>
      <p className="mt-1 max-w-2xl text-xs text-white/35">{t.rewards.stockClaimNote}</p>

      <RewardsList
        rewards={rewards}
        locale={locale}
        dict={t}
        userPoints={points}
        claimedIds={claims.map((c) => c.rewardId)}
        claimVouchers={claimVouchers}
        claimRedeemed={claimRedeemed}
        isLoggedIn={!!user}
      />
    </div>
  );
}
