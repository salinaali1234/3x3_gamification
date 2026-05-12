"use client";

import { useState, useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await updateProfileAction(userId, name);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
          router.refresh();
        });
      }}
      className="flex gap-2 max-w-md"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 rounded border border-white/15 bg-white/5 px-3 py-2 text-sm focus:border-brand-green focus:outline-none"
      />
      <Button type="submit" disabled={isPending || name === initialName}>
        {isPending ? "..." : saved ? dict.profile.saved : dict.profile.save}
      </Button>
    </form>
  );
}
