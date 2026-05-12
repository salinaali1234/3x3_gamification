import { cookies } from "next/headers";
import Link from "next/link";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listChallenges, getStore } from "@/lib/data/store";
import { accentClass, cn } from "@/lib/utils";

export default async function AdminChallenges() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const challenges = listChallenges();
  const store = getStore();
  const counts = challenges.map((c) => ({
    id: c.id,
    attempts: store.challengeAttempts.filter((a) => a.challengeId === c.id).length,
    correct: store.challengeAttempts.filter((a) => a.challengeId === c.id && a.correct).length,
  }));
  const countById = new Map(counts.map((c) => [c.id, c]));

  return (
    <div>
      <p className="text-white/70 text-sm max-w-2xl mb-4">
        {locale === "nl"
          ? "Beheer challenges. In de huidige mockup zijn challenges hardcoded; CRUD-edit komt in een latere versie."
          : "Manage challenges. In the current mockup challenges are hardcoded; CRUD editing comes in a later version."}
      </p>
      <div className="rounded-md border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-white/50">
            <tr>
              <th className="px-4 py-3 text-left">{t.challenges.title}</th>
              <th className="px-4 py-3 text-left">{locale === "nl" ? "Type" : "Type"}</th>
              <th className="px-4 py-3 text-right">pts</th>
              <th className="px-4 py-3 text-right">
                {locale === "nl" ? "Pogingen" : "Attempts"}
              </th>
              <th className="px-4 py-3 text-right">
                {locale === "nl" ? "Correct" : "Correct"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {challenges.map((c) => {
              const stats = countById.get(c.id);
              return (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/challenges/${c.id}`}
                      className="hover:text-brand-green"
                    >
                      {c.title[locale]}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-sm border px-2 py-0.5 brand-section-label",
                        accentClass(c.accent, "border"),
                        accentClass(c.accent, "text")
                      )}
                    >
                      {t.challenges.types[c.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-display text-lg">
                    {c.points}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {stats?.attempts ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-brand-green">
                    {stats?.correct ?? 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
