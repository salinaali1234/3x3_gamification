import { cn, accentClass } from "@/lib/utils";
import type { Badge } from "@/lib/data/types";
import type { Locale } from "@/lib/i18n/config";

export function BadgeSticker({
  badge,
  locale,
  size = "md",
  earned = true,
}: {
  badge: Badge;
  locale: Locale;
  size?: "sm" | "md" | "lg";
  earned?: boolean;
}) {
  const sizes = {
    sm: "h-12 w-12 text-xl",
    md: "h-16 w-16 text-2xl",
    lg: "h-24 w-24 text-4xl",
  };
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "relative grid place-items-center rounded-full border-2 rotate-[-6deg] shadow-lg",
          sizes[size],
          earned ? accentClass(badge.accent, "bg") : "bg-white/5",
          earned ? "border-brand-black" : "border-white/15",
          !earned && "opacity-40 grayscale"
        )}
        title={badge.description[locale]}
      >
        <span className={earned ? "text-brand-black" : ""}>{badge.emoji}</span>
        <span className="absolute -bottom-1 inset-x-1 h-1 bg-brand-black/20 rounded" />
      </div>
      {size !== "sm" ? (
        <span className="text-[10px] uppercase font-mono tracking-wider text-white/70 max-w-[6rem] text-center leading-tight">
          {badge.name[locale]}
        </span>
      ) : null}
    </div>
  );
}
