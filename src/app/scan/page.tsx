import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import { listJourneySteps, userCompletions } from "@/lib/data/store";
import { ScanClient } from "./scan-client";

export default async function ScanPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const steps = listJourneySteps();
  const done = new Set(userCompletions(user.id).map((c) => c.stepId));
  const hint = steps.find((s) => !done.has(s.id))?.code;
  const params = await searchParams;
  const initialCode = params.code?.toUpperCase() ?? "";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3x3 unites // codes</div>
      <h1 className="font-display text-5xl">{t.scan.title}</h1>
      <p className="mt-3 text-white/70">{t.scan.subtitle}</p>

      <ScanClient
        locale={locale}
        dict={t}
        hint={hint}
        initialCode={initialCode}
      />
    </div>
  );
}
