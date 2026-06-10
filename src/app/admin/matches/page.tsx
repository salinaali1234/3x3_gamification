import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listLiveMatches } from "@/lib/data/user-game";
import { AdminMatchScoreForm } from "./match-score-form";

export default async function AdminMatchesPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const matches = await listLiveMatches();

  return (
    <div className="space-y-6">
      <div>
        <div className="brand-section-label mb-2">{t.admin.matches}</div>
        <p className="text-sm text-white/60">{t.admin.matchesHint}</p>
      </div>

      <div className="rounded-md border border-white/10 overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-white/50">
            <tr>
              <th className="px-4 py-3">{t.admin.matchTime}</th>
              <th className="px-4 py-3">{t.admin.matchTeams}</th>
              <th className="px-4 py-3">{t.admin.finalScore}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {matches.map((match) => (
              <tr key={match.id}>
                <td className="px-4 py-3 font-mono text-sm text-white/70">
                  <div>{match.day}</div>
                  <div>{match.startTime}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{match.label[locale]}</div>
                  <div className="text-xs text-white/50">
                    {match.teamA} vs {match.teamB}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <AdminMatchScoreForm match={match} locale={locale} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
