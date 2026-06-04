import type { Dictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

export function FestivalWelcomeIntro({
  dict,
  variant = "full",
}: {
  dict: Dictionary;
  variant?: "full" | "compact";
}) {
  const w = dict.welcome;
  const cards = [
    { title: w.festivalTitle, body: w.festivalBody, accent: "border-brand-orange/40 bg-brand-orange/5" },
    { title: w.venueTitle, body: w.venueBody, accent: "border-brand-green/40 bg-brand-green/5" },
    { title: w.gameTitle, body: w.gameBody, accent: "border-brand-blue/40 bg-brand-blue/5" },
  ];

  return (
    <div className={cn(variant === "compact" ? "space-y-4" : "space-y-6")}>
      {variant === "full" ? (
        <p className="max-w-3xl text-base sm:text-lg text-white/70 leading-relaxed">
          {w.lead}
        </p>
      ) : (
        <p className="text-sm text-white/65 leading-relaxed">{w.leadShort}</p>
      )}
      <div
        className={cn(
          "grid gap-4",
          variant === "compact" ? "grid-cols-1" : "md:grid-cols-3"
        )}
      >
        {cards.map((card) => (
          <article
            key={card.title}
            className={cn(
              "rounded-md border p-5 sm:p-6",
              card.accent,
              variant === "compact" && "p-4"
            )}
          >
            <h3
              className={cn(
                "font-display text-brand-white",
                variant === "compact" ? "text-xl" : "text-2xl"
              )}
            >
              {card.title}
            </h3>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">{card.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
