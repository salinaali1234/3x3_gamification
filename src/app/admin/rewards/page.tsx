import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getProfileById } from "@/lib/data/store";
import {
  listPrizeTiers,
  PRIZE_TIERS,
} from "@/lib/data/challenges-v2";

export default async function AdminRewards() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const tiers = listPrizeTiers();

  // Read redemptions from global v2 store
  const store = (globalThis as { __3X3_V2_STORE__?: { redemptions: Array<{ id: string; userId: string; tierId: string; voucherCode: string; claimedAt: string; costPoints: number }> } }).__3X3_V2_STORE__;
  const redemptions = store?.redemptions ?? [];

  return (
    <div className="space-y-8">
      <section>
        <div className="brand-section-label mb-3">Prize tiers</div>
        <p className="text-white/60 text-sm mb-4">
          {locale === "nl"
            ? "Placeholder tiers. Pas aan in src/lib/data/challenges-v2.ts of via migration 0015."
            : "Placeholder tiers. Edit in src/lib/data/challenges-v2.ts or via migration 0015."}
        </p>
        <div className="rounded-md border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-4 py-3 text-left">Tier</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Cost (pts)</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right">Redeemed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tiers.map((tier) => {
                const claimed = redemptions.filter((r) => r.tierId === tier.id).length;
                const originalStock = PRIZE_TIERS.find((t) => t.id === tier.id)?.stock ?? tier.stock;
                return (
                  <tr key={tier.id}>
                    <td className="px-4 py-3">
                      <span className="text-2xl mr-2">{tier.emoji}</span>
                      {tier.name}
                    </td>
                    <td className="px-4 py-3 text-white/70 max-w-md">{tier.description}</td>
                    <td className="px-4 py-3 text-right font-display text-lg">
                      {tier.costPoints}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {tier.stock === -1 ? "∞" : `${tier.stock} / ${originalStock}`}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-brand-green">
                      {claimed}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="brand-section-label mb-3">
          {locale === "nl" ? "Recente claims" : "Recent claims"}
        </div>
        {redemptions.length === 0 ? (
          <p className="text-white/60 text-sm">{t.common.noResults}</p>
        ) : (
          <ul className="rounded-md border border-white/10 divide-y divide-white/5">
            {[...redemptions]
              .sort(
                (a, b) =>
                  new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime()
              )
              .slice(0, 20)
              .map((r) => {
                const tier = tiers.find((t) => t.id === r.tierId);
                const user = getProfileById(r.userId);
                return (
                  <li
                    key={r.id}
                    className="px-4 py-3 flex items-center justify-between text-sm"
                  >
                    <span>
                      <span className="text-xl mr-2">{tier?.emoji}</span>
                      <span className="font-medium">{tier?.name}</span>
                      <span className="text-white/50">
                        {" "}· {user?.displayName ?? "Unknown"} · -{r.costPoints} pts
                      </span>
                    </span>
                    <span className="font-mono text-xs text-brand-green">
                      {r.voucherCode}
                    </span>
                  </li>
                );
              })}
          </ul>
        )}
      </section>
    </div>
  );
}
