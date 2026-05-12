"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { setLocaleAction } from "@/app/actions";

export function LocaleSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(loc: Locale) {
    if (loc === current) return;
    startTransition(async () => {
      await setLocaleAction(loc);
      router.refresh();
    });
  }

  return (
    <div className="hidden md:flex items-center rounded border border-white/15 overflow-hidden text-xs font-mono">
      <button
        type="button"
        disabled={isPending}
        onClick={() => switchTo("nl")}
        className={`px-2 py-1 transition-colors ${
          current === "nl"
            ? "bg-brand-green text-brand-black"
            : "text-white/70 hover:text-brand-white"
        }`}
      >
        NL
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => switchTo("en")}
        className={`px-2 py-1 transition-colors ${
          current === "en"
            ? "bg-brand-green text-brand-black"
            : "text-white/70 hover:text-brand-white"
        }`}
      >
        EN
      </button>
    </div>
  );
}
