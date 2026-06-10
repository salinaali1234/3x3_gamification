"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LiveMatch } from "@/lib/data/types";
import type { Locale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";

export function AdminMatchScoreForm({
  match,
  locale,
}: {
  match: LiveMatch;
  locale: Locale;
}) {
  const router = useRouter();
  const [score, setScore] = useState(match.finalScore ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/matches/${match.id}/score`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ finalScore: score }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setMessage(data.error ?? "error");
        return;
      }
      setMessage(locale === "nl" ? "Opgeslagen" : "Saved");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        value={score}
        onChange={(e) => setScore(e.target.value)}
        placeholder="21-18"
        className="w-full sm:max-w-[120px] rounded border border-white/15 bg-brand-black px-3 py-2 font-mono text-sm focus:border-brand-green focus:outline-none"
      />
      <Button onClick={submit} disabled={submitting} variant="secondary" className="shrink-0">
        {submitting ? "…" : locale === "nl" ? "Opslaan" : "Save"}
      </Button>
      {message ? <span className="text-xs text-brand-green">{message}</span> : null}
    </div>
  );
}
