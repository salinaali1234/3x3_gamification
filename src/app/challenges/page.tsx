import { cookies } from "next/headers";
import Link from "next/link";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import { listChallenges, userAttempts } from "@/lib/data/store";
import { accentClass, cn } from "@/lib/utils";

export default async function ChallengesPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const user = await getCurrentUser();
  const challenges = listChallenges();
  const done = user
    ? new Set(userAttempts(user.id).map((a) => a.challengeId))
    : new Set();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3x3 unites // challenges</div>
      <h1 className="font-display text-5xl sm:text-6xl">{t.challenges.title}</h1>
      <p className="mt-3 text-white/70 max-w-2xl">{t.challenges.subtitle}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {challenges.map((c) => {
          const isDone = done.has(c.id);
          return (
            <Link
              key={c.id}
              href={`/challenges/${c.id}`}
              className={cn(
                "group rounded-md border bg-white/[0.02] p-5 transition-colors",
                isDone
                  ? "border-brand-green/40"
                  : "border-white/10 hover:border-brand-green/40"
              )}
            >
              <div
                className={cn(
                  "inline-block px-2 py-0.5 brand-section-label rounded-sm border",
                  accentClass(c.accent, "border"),
                  accentClass(c.accent, "text")
                )}
              >
                {t.challenges.types[c.type]}
              </div>
              <h3 className="font-display text-2xl mt-3">{c.title[locale]}</h3>
              <p className="text-sm text-white/70 mt-1 line-clamp-3">
                {c.description[locale]}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className={cn("font-display text-2xl", accentClass(c.accent, "text"))}>
                  +{c.points} pts
                </span>
                {isDone ? (
                  <span className="brand-section-label !text-brand-green">
                    ✓ {t.common.completed}
                  </span>
                ) : (
                  <span className="text-white/40 font-mono text-xs uppercase tracking-wider group-hover:text-brand-green">
                    {t.common.next} →
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {!user ? (
        <p className="mt-8 text-sm text-white/50">
          {locale === "nl"
            ? "Log in om challenges te doen."
            : "Log in to attempt challenges."}
        </p>
      ) : null}
    </div>
  );
}
