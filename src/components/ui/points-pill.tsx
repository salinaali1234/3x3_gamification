import { cn } from "@/lib/utils";

export function PointsPill({
  points,
  size = "md",
  accent = "green",
  className,
}: {
  points: number;
  size?: "sm" | "md" | "lg";
  accent?: "green" | "orange" | "blue";
  className?: string;
}) {
  const sizes = {
    sm: "h-6 text-xs px-2",
    md: "h-8 text-sm px-3",
    lg: "h-10 text-base px-4",
  };
  const accents = {
    green: "bg-brand-green text-brand-black",
    orange: "bg-brand-orange text-brand-black",
    blue: "bg-brand-blue text-brand-black",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium tabular-nums",
        sizes[size],
        accents[accent],
        className
      )}
    >
      <span className="font-display text-base leading-none">+{points}</span>
      <span className="brand-section-label !text-brand-black/70">pts</span>
    </span>
  );
}
