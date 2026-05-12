import { cn } from "@/lib/utils";

export function SectionLabel({
  number,
  children,
  className,
}: {
  number?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 brand-section-label", className)}>
      {number ? <span className="text-white/40">{number}</span> : null}
      <span className="text-white/60">{children}</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}
