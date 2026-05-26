"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SyncCmButton({ locale }: { locale: "nl" | "en" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function testConnection() {
    setStatus(null);
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/cm/sync");
      const data = await res.json();
      if (data.ok) {
        setStatus(
          locale === "nl"
            ? `CM verbonden (${data.status})`
            : `CM connected (${data.status})`
        );
      } else {
        setError(data.message || data.error || "Connection failed");
      }
    });
  }

  function sync() {
    setStatus(null);
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/cm/sync", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setStatus(
          locale === "nl"
            ? `Sync klaar: ${data.fetched} orders, ${data.created} nieuw, ${data.skipped} overgeslagen`
            : `Sync done: ${data.fetched} orders, ${data.created} new, ${data.skipped} skipped`
        );
        if (data.errors?.length) {
          setError(data.errors.slice(0, 3).join("; "));
        }
        router.refresh();
      } else {
        setError(data.error || data.hint || "Sync failed");
      }
    });
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={testConnection}
        >
          {locale === "nl" ? "Test CM verbinding" : "Test CM connection"}
        </Button>
        <Button type="button" size="sm" disabled={isPending} onClick={sync}>
          {isPending
            ? "..."
            : locale === "nl"
            ? "Haal ticketkopers op van CM"
            : "Fetch ticket buyers from CM"}
        </Button>
      </div>
      {status ? <p className="text-sm text-brand-green">{status}</p> : null}
      {error ? <p className="text-sm text-brand-orange">{error}</p> : null}
      <p className="text-xs text-white/50 max-w-xl">
        {locale === "nl"
          ? "Vul CM_API_TOKEN en CM_EVENT_UUID in .env.local in. Bij 401: vraag CM welke Authorization-header ze verwachten (Bearer vs apiKey)."
          : "Set CM_API_TOKEN and CM_EVENT_UUID in .env.local. On 401: ask CM which Authorization header they expect (Bearer vs apiKey)."}
      </p>
    </div>
  );
}
