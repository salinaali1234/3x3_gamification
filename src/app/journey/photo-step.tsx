"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";

export function PhotoStepUploader({
  stepId,
  locale,
  dict,
}: {
  stepId: string;
  locale: Locale;
  dict: Dictionary;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function pick() {
    inputRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  async function upload() {
    if (!preview) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/journey/photo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stepId, photoDataUrl: preview }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(
          data.error === "already"
            ? dict.scan.already
            : data.error === "leader_hub_locked"
            ? dict.scan.leaderHubLocked
            : dict.scan.invalid
        );
        return;
      }
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-3 space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFile}
        className="hidden"
      />
      {preview ? (
        <img
          src={preview}
          alt={dict.journey.photoPreview}
          className="max-h-64 w-full rounded border border-white/20 object-cover"
        />
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button onClick={pick} variant="outline" size="sm">
          {preview ? dict.journey.retakePhoto : dict.journey.takePhoto}
        </Button>
        {preview ? (
          <Button onClick={upload} disabled={submitting} variant="primary" size="sm">
            {submitting ? "…" : dict.journey.uploadPhoto}
          </Button>
        ) : null}
      </div>
      {error ? (
        <p className="text-xs text-brand-orange">
          {error}{" "}
          <span className="font-mono">({locale})</span>
        </p>
      ) : null}
    </div>
  );
}
