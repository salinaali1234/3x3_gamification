"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";

export function QrCard({
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const QRCode = (await import("qrcode")).default;
      const canvas = canvasRef.current;
      if (!canvas || cancelled) return;
      await QRCode.toCanvas(canvas, code, {
        width: 256,
        margin: 2,
        color: { dark: "#000000", light: "#FFFFFF" },
      });
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${code}.png`;
    link.click();
  }

  return (
    <div className="rounded-md border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-3">
        <span
          className={`brand-section-label ${
            targetType === "step" ? "!text-brand-orange" : "!text-brand-green"
          }`}
        >
          {targetType}
        </span>
        <code className="text-xs font-mono text-white/60">{code}</code>
      </div>
      <div className="aspect-square w-full grid place-items-center bg-white rounded">
        <canvas ref={canvasRef} />
      </div>
      <div className="mt-3 text-sm truncate" title={label}>
        {label}
      </div>
      <div className="mt-3">
        <Button size="sm" variant="outline" onClick={download} disabled={!ready}>
          {dict.admin.download}
        </Button>
      </div>
    </div>
  );
}
