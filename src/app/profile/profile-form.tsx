"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "./actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";

export function ProfileForm({
  userId,
  initialName,
  dict,
}: {
  userId: string;
  initialName: string;
  dict: Dictionary;
}) {
  const [name, setName] = useState(initialName);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await updateProfileAction(userId, name);
          if (!result.ok) {
            setError(result.error ?? "save_failed");
            return;
          }
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
          router.refresh();
        });
      }}
      className="flex flex-col gap-2 max-w-md"
    >
      <div className="flex gap-2">
        <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 rounded border border-white/15 bg-white/5 px-3 py-2 text-sm focus:border-brand-green focus:outline-none"
      />
      <Button type="submit" disabled={isPending || name.trim() === initialName.trim()}>
        {isPending ? "..." : saved ? dict.profile.saved : dict.profile.save}
      </Button>
      </div>
      {error ? (
        <p className="text-sm text-brand-orange">{dict.profile.saveError}</p>
      ) : null}
    </form>
  );
}
