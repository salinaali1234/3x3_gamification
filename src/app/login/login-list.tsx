"use client";

import { useState, useTransition } from "react";
import { loginAsAction } from "@/app/actions";
import { Avatar } from "@/components/ui/avatar";

export function LoginList({
  options,
}: {
  options: { id: string; name: string; role: "participant" | "admin"; avatarColor: string }[];
}) {
  const [filter, setFilter] = useState("");
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const visible = options.filter((o) =>
    o.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <input
        type="search"
        placeholder="Zoek deelnemer..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full rounded border border-white/15 bg-white/5 px-4 py-2 text-sm placeholder:text-white/40 focus:border-brand-green focus:outline-none"
      />
      <ul className="mt-4 grid gap-2 max-h-[420px] overflow-y-auto pr-1">
        {visible.map((o) => (
          <li key={o.id}>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setPendingId(o.id);
                startTransition(async () => {
                  await loginAsAction(o.id);
                });
              }}
              className="w-full flex items-center justify-between gap-3 rounded border border-white/10 bg-white/[0.03] p-3 text-left hover:border-brand-green/50 hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <span className="flex items-center gap-3">
                <Avatar name={o.name} color={o.avatarColor} />
                <span>
                  <span className="block">{o.name}</span>
                  <span className="block text-xs text-white/50 font-mono uppercase tracking-wider">
                    {o.role}
                  </span>
                </span>
              </span>
              <span className="text-xs text-white/40 font-mono">
                {pendingId === o.id && isPending ? "..." : "→"}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
