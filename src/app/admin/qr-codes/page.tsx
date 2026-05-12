import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  getChallengeById,
  getJourneyStepById,
  listQrCodes,
} from "@/lib/data/store";
import { QrCard } from "./qr-card";

export default async function AdminQrCodes() {
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
          ? "Print deze QR codes en plak ze op de juiste locaties. Iedere code triggert een journey-stap of een challenge bij scannen."
          : "Print these QR codes and place them at the right locations. Each code triggers a journey step or a challenge when scanned."}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {enriched.map((q) => (
          <QrCard key={q.code} code={q.code} label={q.label} targetType={q.targetType} dict={t} />
        ))}
      </div>
    </div>
  );
}
