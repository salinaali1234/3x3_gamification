import { cn } from "@/lib/utils";

export function Logo3x3({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="font-display text-2xl leading-none tracking-tight">
        3x3
      </span>
      <span className="font-display text-2xl leading-none tracking-tight text-brand-green">
        UNITES
      </span>
    </div>
  );
}
