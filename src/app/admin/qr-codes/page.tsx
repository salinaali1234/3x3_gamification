import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  getChallengeById,
  getJourneyStepById,
  listQrCodes,
} from "@/lib/data/store";
import { CodeCard } from "./code-card";

export default async function AdminCodesPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const codes = listQrCodes();
  const enriched = codes.map((q) => {
    const target =
      q.targetType === "step"
        ? getJourneyStepById(q.targetId)
        : getChallengeById(q.targetId);
    return {
      code: q.code,
      targetType: q.targetType,
      label: target ? ("title" in target ? target.title[locale] : "—") : "—",
    };
  });

  return (
    <div className="space-y-6">
      <p className="text-white/70 text-sm max-w-2xl">
        {locale === "nl"
          ? "Print deze codes en hang ze op bij de juiste locaties. Deelnemers typen de code in de app om punten te verdienen."
          : "Print these codes and place them at the right locations. Participants type the code in the app to earn points."}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {enriched.map((q) => (
          <CodeCard
            key={q.code}
            code={q.code}
            label={q.label}
            targetType={q.targetType}
            dict={t}
          />
        ))}
      </div>
    </div>
  );
}
