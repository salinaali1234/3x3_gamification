import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  listChallengesByLocation,
  listUnifiedChallenges,
} from "@/lib/data/challenges-v2";
import { accentClass, cn } from "@/lib/utils";

export default async function AdminChallenges() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const groups = listChallengesByLocation();
  const totalChallenges = listUnifiedChallenges().length;
  const totalPoints = listUnifiedChallenges().reduce((s, c) => s + c.points, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline gap-4">
        <h2 className="brand-section-label">{t.admin.challenges}</h2>
        <span className="text-sm text-white/55">
          {totalChallenges} challenges · {totalPoints} pts total · {groups.length} locations
        </span>
      </div>

      <p className="text-white/70 text-sm max-w-2xl">
        {locale === "nl"
          ? "Unified challenges (v2). Bewerk de seed in src/lib/data/challenges-v2.ts of run migration 0015 op Supabase."
          : "Unified challenges (v2). Edit the seed in src/lib/data/challenges-v2.ts or apply migration 0015 in Supabase."}
      </p>

      {groups.map((group) => (
        <section key={group.location}>
          <div className="brand-section-label mb-2">{group.location}</div>
          <div className="rounded-md border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-white/50">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Verification</th>
                  <th className="px-4 py-3 text-left">Code / answer</th>
                  <th className="px-4 py-3 text-left">Day</th>
                  <th className="px-4 py-3 text-right">pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {group.challenges.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-white/55 mt-0.5">{c.subtitle}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-sm border px-2 py-0.5 brand-section-label",
                          accentClass(c.accent, "border"),
                          accentClass(c.accent, "text")
                        )}
                      >
                        {c.verification}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-white/70">
                      {c.verification === "code"
                        ? c.code
                        : c.verification === "fence"
                          ? c.letters?.join(" ")
                          : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/55">
                      {c.dayFlag ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-display text-lg">
                      {c.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
