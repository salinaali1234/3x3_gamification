import type { Badge } from "@/lib/data/types";
import type { Locale } from "@/lib/i18n/config";
import { accentClass, cn } from "@/lib/utils";

export function BadgeTicker({
  badges,
  locale,
}: {
  badges: Badge[];
  locale: Locale;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className="flex items-center gap-4 rounded-md border border-brand-black/10 bg-white p-4"
        >
          <div
            className={cn(
              "grid h-14 w-14 place-items-center rounded-full rotate-[-6deg] border-2 border-brand-black shadow",
              accentClass(badge.accent, "bg")
            )}
          >
            <span className="text-2xl">{badge.emoji}</span>
          </div>
          <div>
            <div className="font-display text-xl leading-none">{badge.name[locale]}</div>
            <p className="text-sm text-brand-black/70 mt-1">{badge.description[locale]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
