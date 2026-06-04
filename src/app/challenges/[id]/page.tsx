import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import {
  getChallengeById,
  pollResults,
} from "@/lib/data/store";
import { getUserAttempts, hasChallengeAttempt } from "@/lib/data/user-game";
import { ChallengeRunner } from "./challenge-runner";
import { accentClass } from "@/lib/utils";

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const challenge = getChallengeById(id);
  if (!challenge) notFound();

  const alreadyDone = await hasChallengeAttempt(user.id, challenge.id);
  const previous = (await getUserAttempts(user.id)).find(
    (a) => a.challengeId === challenge.id
  );
  const pollVotes = challenge.type === "poll" ? pollResults(challenge.id) : [];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/challenges"
        className="text-sm text-white/50 hover:text-brand-green font-mono uppercase tracking-wider"
      >
        ← {t.nav.challenges}
      </Link>
      <div className={`mt-3 inline-block px-2 py-0.5 brand-section-label rounded-sm border ${accentClass(challenge.accent, "border")} ${accentClass(challenge.accent, "text")}`}>
        {t.challenges.types[challenge.type]}
      </div>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">
        {challenge.title[locale]}
      </h1>
      <p className="mt-2 text-white/70">{challenge.description[locale]}</p>
      <div className={`mt-3 font-display text-3xl ${accentClass(challenge.accent, "text")}`}>
        +{challenge.points} pts
      </div>

      <div className="mt-8">
        <ChallengeRunner
          challenge={challenge}
          locale={locale}
          dict={t}
          alreadyDone={alreadyDone}
          previousAnswer={previous?.answer ?? null}
          pollResults={pollVotes.reduce<Record<number, number>>((acc, v) => {
            acc[v.optionIndex] = (acc[v.optionIndex] ?? 0) + 1;
            return acc;
          }, {})}
        />
      </div>
    </div>
  );
}
