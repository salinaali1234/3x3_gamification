import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { listUnifiedChallenges } from "@/lib/data/challenges-v2";
import { CodeCard } from "./code-card";

export default async function AdminCodesPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const challenges = listUnifiedChallenges();
  const codeChallenges = challenges.filter((c) => c.verification === "code" && c.code);

  return (
    <div className="space-y-6">
      <p className="text-white/70 text-sm max-w-2xl">
        {locale === "nl"
          ? "Print deze codes en geef ze aan de leaders op de juiste locaties. Deelnemers typen de code in op de challenge-kaart om punten te verdienen."
          : "Print these codes and hand them to the leaders at the right locations. Participants type the code on the challenge card to earn points."}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {codeChallenges.map((c) => (
          <CodeCard
            key={c.id}
            code={c.code!}
            label={c.title}
            targetType="challenge"
            dict={t}
          />
        ))}
      </div>

      <section className="rounded-md border border-brand-orange/30 bg-brand-orange/5 p-4">
        <h2 className="brand-section-label !text-brand-orange">Fence challenge</h2>
        <p className="text-sm text-white/70 mt-2">
          {locale === "nl"
            ? "De fence-challenge gebruikt 10 letters die deelnemers van de 10 fence-leaders krijgen. Ze typen ze in de juiste volgorde."
            : "The fence challenge uses 10 letters that participants collect from the 10 fence leaders. They enter them in the correct order."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 font-display text-2xl">
          {challenges
            .find((c) => c.verification === "fence")
            ?.letters?.map((l, i) => (
              <span
                key={i}
                className="inline-flex h-10 w-10 items-center justify-center rounded border border-brand-orange/40 bg-brand-orange/10 text-brand-orange"
              >
                {l}
              </span>
            ))}
        </div>
      </section>
    </div>
  );
}
