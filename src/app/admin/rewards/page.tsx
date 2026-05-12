import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getProfileById, getRewardById, getStore, listRewards } from "@/lib/data/store";

export default async function AdminRewards() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const rewards = listRewards();
  const claims = getStore().rewardClaims;

  return (
    <div className="space-y-8">
      <section>
        <div className="brand-section-label mb-3">{t.admin.rewards}</div>
        <div className="rounded-md border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-4 py-3 text-left">{locale === "nl" ? "Naam" : "Name"}</th>
                <th className="px-4 py-3 text-left">{locale === "nl" ? "Type" : "Type"}</th>
                <th className="px-4 py-3 text-right">pts</th>
                <th className="px-4 py-3 text-right">{t.rewards.stock}</th>
                <th className="px-4 py-3 text-right">
                  {locale === "nl" ? "Geclaimd" : "Claimed"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rewards.map((r) => {
                const claimed = claims.filter((c) => c.rewardId === r.id).length;
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3">
                      <span className="text-2xl mr-2">{r.emoji}</span>
                      {r.name[locale]}
                    </td>
                    <td className="px-4 py-3 brand-section-label">{r.type}</td>
                    <td className="px-4 py-3 text-right font-display text-lg">{r.costPoints}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.stock}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-brand-green">{claimed}</td>
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
        {claims.length === 0 ? (
          <p className="text-white/60 text-sm">{t.common.noResults}</p>
        ) : (
          <ul className="rounded-md border border-white/10 divide-y divide-white/5">
            {[...claims]
              .sort(
                (a, b) =>
                  new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime()
              )
              .slice(0, 20)
              .map((c) => {
                const rw = getRewardById(c.rewardId);
                const user = getProfileById(c.userId);
                return (
                  <li
                    key={c.id}
                    className="px-4 py-3 flex items-center justify-between text-sm"
                  >
                    <span>
                      <span className="text-xl mr-2">{rw?.emoji}</span>
                      <span className="font-medium">{rw?.name[locale]}</span>
                      <span className="text-white/50">
                        {" "}
                        · {user?.displayName}
                      </span>
                    </span>
                    <span className="font-mono text-xs text-brand-green">
                      {c.voucherCode}
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
