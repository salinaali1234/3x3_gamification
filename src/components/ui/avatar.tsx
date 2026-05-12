import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  color,
  size = "md",
  className,
}: {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
    xl: "h-20 w-20 text-2xl",
  };
  return (
    <span
      className={cn(
        "inline-grid place-items-center rounded-full font-display tracking-wide text-brand-black",
        sizes[size],
        className
      )}
      style={{ background: color }}
    >
      {initials(name)}
    </span>
  );
}
