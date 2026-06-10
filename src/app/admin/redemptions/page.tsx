import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { RedemptionsClient } from "./redemptions-client";

export default async function AdminRedemptionsPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const supabaseEnabled = isSupabaseConfigured();

  return (
    <div className="space-y-4">
      <div>
        <div className="brand-section-label mb-2">{t.admin.redemptions}</div>
        <p className="text-sm text-white/65 max-w-2xl">{t.admin.redemptionsHint}</p>
      </div>

      {!supabaseEnabled ? (
        <p className="rounded-md border border-brand-orange/40 bg-brand-orange/10 px-4 py-3 text-sm text-brand-orange">
          {t.admin.redemptionsSupabaseOnly}
        </p>
      ) : (
        <RedemptionsClient
          locale={locale}
          labels={{
            searchPlaceholder: t.admin.redemptionsSearchPlaceholder,
            search: t.admin.redemptionsSearch,
            searching: t.admin.redemptionsSearching,
            hint: t.admin.redemptionsLookupHint,
            noResults: t.admin.redemptionsNoResults,
            kindReward: t.admin.redemptionsKindReward,
            kindWheel: t.admin.redemptionsKindWheel,
            claimedAt: t.admin.redemptionsClaimedAt,
            redeemedAt: t.admin.redemptionsRedeemed,
            pending: t.admin.redemptionsPending,
            markRedeemed: t.admin.redemptionsMarkRedeemed,
            redeeming: t.admin.redemptionsRedeeming,
            alreadyRedeemed: t.admin.redemptionsAlreadyRedeemed,
            notFound: t.admin.redemptionsNotFound,
            errorGeneric: t.admin.redemptionsError,
          }}
        />
      )}
    </div>
  );
}
