"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";

export function SimulateButton({ dict }: { dict: Dictionary }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [created, setCreated] = useState<{ id: string; name: string } | null>(null);

  function submit() {
    if (!name || !email) return;
    startTransition(async () => {
      const res = await fetch("/api/cm/mock-purchase", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (data.ok) {
        setCreated({ id: data.userId, name: data.displayName });
        setName("");
        setEmail("");
        router.refresh();
      }
    });
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-2 max-w-2xl">
        <input
          type="text"
          value={name}
          placeholder={dict.profile.displayName}
          onChange={(e) => setName(e.target.value)}
          className="rounded border border-white/15 bg-brand-black px-3 py-2 text-sm focus:border-brand-green focus:outline-none"
        />
        <input
          type="email"
          value={email}
          placeholder="email@example.com"
          onChange={(e) => setEmail(e.target.value)}
          className="rounded border border-white/15 bg-brand-black px-3 py-2 text-sm font-mono focus:border-brand-green focus:outline-none"
        />
      </div>
      <div className="mt-3">
        <Button onClick={submit} disabled={isPending || !name || !email}>
          {isPending ? "..." : dict.admin.simulatePurchase}
        </Button>
      </div>
      {created ? (
        <p className="mt-3 text-sm text-brand-green">
          ✓ Deelnemer aangemaakt: <strong>{created.name}</strong> (id:{" "}
          <code className="font-mono">{created.id}</code>)
        </p>
      ) : null}
    </div>
  );
}
