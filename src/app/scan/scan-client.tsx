"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";

type ScanResult =
  | {
      ok: true;
      type: "step" | "challenge";
      target: { id: string; title: { nl: string; en: string }; points: number };
      newBadges: { id: string; emoji: string; name: { nl: string; en: string } }[];
    }
  | { ok: false; error: string };

export function ScanClient({
  locale,
  dict,
  hint,
}: {
  locale: Locale;
  dict: Dictionary;
  hint?: string;
}) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const router = useRouter();

  async function submit(value: string) {
    if (!value.trim() || submitting) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: value.trim() }),
      });
      const data = (await res.json()) as ScanResult;
      setResult(data);
      if (data.ok) {
        setCode("");
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function startCamera() {
    setCameraError(null);
    try {
      const mod = await import("html5-qrcode");
      const { Html5Qrcode } = mod;
      const elemId = "qr-scanner-region";
      const html5QrCode = new Html5Qrcode(elemId);
      scannerRef.current = {
        stop: async () => {
          try {
            await html5QrCode.stop();
            await html5QrCode.clear();
          } catch {}
        },
      };
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 240 },
        async (decoded) => {
          await scannerRef.current?.stop();
          scannerRef.current = null;
          setCameraActive(false);
          submit(decoded);
        },
        () => {}
      );
      setCameraActive(true);
    } catch (e) {
      setCameraError(dict.scan.cameraError);
      console.warn(e);
    }
  }

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  return (
    <div className="mt-8 space-y-6">
      <div className="rounded-md border border-white/15 bg-white/[0.02] p-4">
        <div
          ref={containerRef}
          id="qr-scanner-region"
          className="aspect-square w-full overflow-hidden rounded bg-brand-black fence-pattern grid place-items-center"
        >
          {!cameraActive ? (
            <div className="text-center px-6">
              <p className="text-white/60 text-sm mb-3">
                {cameraError ?? dict.scan.subtitle}
              </p>
              <Button onClick={startCamera} variant="primary">
                {locale === "nl" ? "Start camera" : "Start camera"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-md border border-white/15 bg-white/[0.02] p-4">
        <label className="brand-section-label">{dict.scan.manualEntry}</label>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={hint ?? dict.scan.manualPlaceholder}
            className="flex-1 rounded border border-white/15 bg-brand-black px-3 py-2 font-mono text-sm placeholder:text-white/30 focus:border-brand-green focus:outline-none"
          />
          <Button onClick={() => submit(code)} disabled={submitting || !code}>
            {submitting ? "..." : dict.scan.submit}
          </Button>
        </div>
        {hint ? (
          <p className="mt-2 text-xs text-white/40 font-mono">
            {locale === "nl" ? "Hint: probeer" : "Hint: try"} {hint}
          </p>
        ) : null}
      </div>

      {result ? (
        result.ok ? (
          <div className="rounded-md border border-brand-green/40 bg-brand-green/10 p-5">
            <div className="brand-section-label !text-brand-green mb-1">
              {dict.scan.success}
            </div>
            <h3 className="font-display text-2xl">
              {result.target.title[locale]}
            </h3>
            <div className="mt-2 font-display text-3xl text-brand-green">
              +{result.target.points} pts
            </div>
            {result.newBadges?.length ? (
              <div className="mt-4">
                <div className="brand-section-label mb-2">
                  {locale === "nl" ? "Nieuwe badges!" : "New badges!"}
                </div>
                <div className="flex flex-wrap gap-3">
                  {result.newBadges.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-2 rounded-full bg-brand-green/20 border border-brand-green/40 px-3 py-1 text-sm"
                    >
                      <span className="text-xl">{b.emoji}</span>
                      <span>{b.name[locale]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-md border border-brand-orange/40 bg-brand-orange/10 p-5 text-sm">
            {result.error === "already"
              ? dict.scan.already
              : result.error === "invalid"
              ? dict.scan.invalid
              : result.error}
          </div>
        )
      ) : null}
    </div>
  );
}
