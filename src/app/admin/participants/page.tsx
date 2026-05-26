import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listProfiles, totalPoints, userCompletions } from "@/lib/data/store";
import { Avatar } from "@/components/ui/avatar";
import { SimulateButton } from "./simulate-button";

export default async function AdminParticipants() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const profiles = listProfiles();

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-brand-green/40 bg-brand-green/5 p-5">
        <div className="brand-section-label !text-brand-green mb-1">demo</div>
        <h2 className="font-display text-2xl">{t.admin.addDemoParticipant}</h2>
        <p className="text-sm text-white/70 mt-1">{t.admin.addDemoParticipantBody}</p>
        <div className="mt-3">
          <SimulateButton dict={t} />
        </div>
      </div>

      <div className="rounded-md border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-white/50">
            <tr>
              <th className="px-4 py-3 text-left">{locale === "nl" ? "Naam" : "Name"}</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">
                {locale === "nl" ? "Email" : "Email"}
              </th>
              <th className="px-4 py-3 text-right">
                {locale === "nl" ? "Stappen" : "Steps"}
              </th>
              <th className="px-4 py-3 text-right">pts</th>
              <th className="px-4 py-3 text-left">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {profiles.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={p.displayName} color={p.avatarColor} size="sm" />
                    {p.displayName}
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs text-white/60">
                  {p.email}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {userCompletions(p.id).length}
                </td>
                <td className="px-4 py-3 text-right font-display text-lg">
                  {totalPoints(p.id)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`brand-section-label ${
                      p.role === "admin" ? "!text-brand-orange" : ""
                    }`}
                  >
                    {p.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
