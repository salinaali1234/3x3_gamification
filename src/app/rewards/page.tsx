import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import {
  listPrizeTiers,
  userPointsBalance,
  userRedemptions,
} from "@/lib/data/challenges-v2";
import { AuthRequiredPanel } from "@/components/auth-required-panel";

export default async function RewardsPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const user = await getCurrentUser();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3X3 UNITES // rewards</div>
      <h1 className="font-display text-5xl sm:text-6xl">Prize shop</h1>
      <p className="mt-3 text-white/70 max-w-2xl">
        Spend the points you&apos;ve earned from challenges. Prize tiers unlock in
        order — the higher the tier, the bigger the prize. Pick up physical
        rewards at the festival reward shop using your voucher.
      </p>

      {!user ? (
        <AuthRequiredPanel dict={t} />
      ) : (
        <RewardsContent userId={user.id} />
      )}
    </div>
  );
}

async function RewardsContent({ userId }: { userId: string }) {
  const tiers = listPrizeTiers();
  const balance = userPointsBalance(userId);
  const redemptions = userRedemptions(userId);

  const { RewardsClient } = await import("./rewards-client");

  return (
    <div className="mt-10">
      <RewardsClient
        tiers={tiers}
        initialBalance={balance}
        initialRedemptions={redemptions}
      />
    </div>
  );
}
