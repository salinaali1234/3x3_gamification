"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { Profile } from "@/lib/data/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { logoutAction } from "@/app/actions";
import { initials } from "@/lib/utils";

export function UserMenu({
  user,
  locale,
}: {
  user: Profile | null;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full bg-brand-green px-4 py-1.5 text-sm font-medium text-brand-black hover:bg-brand-green/90 transition-colors"
      >
        {t.nav.login}
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-white/15 pr-3 py-0.5 hover:border-white/30"
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full font-display text-sm text-brand-black"
          style={{ background: user.avatarColor }}
        >
          {initials(user.displayName)}
        </span>
        <span className="hidden sm:inline text-sm text-white/80">
          {user.displayName.split(" ")[0]}
        </span>
      </button>
      {open ? (
        <>
          <button
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-label="close"
          />
          <div className="absolute right-0 z-50 mt-2 w-48 rounded border border-white/15 bg-ink-soft shadow-xl">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm hover:bg-white/5"
            >
              {t.nav.profile}
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm hover:bg-white/5"
            >
              Dashboard
            </Link>
            {user.role === "admin" ? (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-brand-green hover:bg-white/5"
              >
                {t.nav.admin}
              </Link>
            ) : null}
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  await logoutAction();
                  setOpen(false);
                });
              }}
              className="block w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/5"
            >
              {t.nav.logout}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
