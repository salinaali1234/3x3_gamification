import type { Dictionary } from "@/lib/i18n/dictionaries";

export function CodeCard({
  code,
  label,
  targetType,
  dict,
}: {
  code: string;
  label: string;
  targetType: "step" | "challenge";
  dict: Dictionary;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.02] p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span
          className={`brand-section-label ${
            targetType === "step" ? "!text-brand-orange" : "!text-brand-green"
          }`}
        >
          {targetType}
        </span>
      </div>
      <div className="flex-1 grid place-items-center rounded bg-brand-black border border-white/10 py-8 px-4">
        <span className="font-display text-3xl sm:text-4xl tracking-wider text-brand-green text-center break-all">
          {code}
        </span>
      </div>
      <p className="mt-3 text-sm truncate" title={label}>
        {label}
      </p>
      <p className="mt-1 text-xs text-white/40">{dict.admin.printHint}</p>
    </div>
  );
}
