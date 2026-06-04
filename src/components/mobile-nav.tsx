"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Profile } from "@/lib/data/types";
import { setLocaleAction, logoutAction } from "@/app/actions";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

type NavItem = { href: string; label: string };

export function MobileNav({
  items,
  locale,
  user,
  points,
  pointsLabel,
  profileLabel,
  dashboardLabel,
  adminLabel,
  loginLabel,
  registerLabel,
  logoutLabel,
}: {
  items: NavItem[];
  locale: Locale;
  user: Profile | null;
  points: number | null;
  pointsLabel: string;
  profileLabel: string;
  dashboardLabel: string;
  adminLabel: string;
  loginLabel: string;
  registerLabel: string;
  logoutLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function switchLocale(loc: Locale) {
    if (loc === locale) return;
    setLocaleAction(loc);
  }

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
      setOpen(false);
    });
  }

  const drawer =
    open && mounted ? (
      <div
        className="lg:hidden fixed inset-0 z-[100]"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />
        <nav
          id="mobile-drawer"
          className="absolute right-0 top-0 z-[101] flex h-full w-[min(88vw,380px)] flex-col overflow-y-auto bg-brand-black border-l border-white/10 shadow-2xl px-5 pb-8 pt-[max(env(safe-area-inset-top),1rem)]"
        >
          <div className="flex items-center justify-between shrink-0">
            <span className="brand-section-label">3X3 UNITES</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded border border-white/15 text-white/70 hover:text-white"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>

          {user ? (
            <div className="mt-4 shrink-0 flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.03] px-4 py-3">
              <Avatar name={user.displayName} color={user.avatarColor} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{user.displayName}</p>
                {points !== null ? (
                  <p className="text-sm text-brand-green tabular-nums">
                    {points} {pointsLabel}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <p className="mt-5 mb-2 brand-section-label shrink-0">Menu</p>
          <ul className="flex flex-col gap-0.5">
            {items.map((it) => {
              const active =
                it.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(it.href);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded px-4 py-3.5 text-base font-medium transition-colors",
                      active
                        ? "bg-brand-green/15 text-brand-green"
                        : "text-white hover:bg-white/5"
                    )}
                  >
                    {it.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="mt-5 mb-2 brand-section-label shrink-0">Account</p>
          <ul className="flex flex-col gap-0.5">
            {user ? (
              <>
                <li>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="block rounded px-4 py-3.5 text-base text-white hover:bg-white/5"
                  >
                    {dashboardLabel}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="block rounded px-4 py-3.5 text-base text-white hover:bg-white/5"
                  >
                    {profileLabel}
                  </Link>
                </li>
                {user.role === "admin" ? (
                  <li>
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="block rounded px-4 py-3.5 text-base text-brand-green hover:bg-brand-green/10"
                    >
                      {adminLabel}
                    </Link>
                  </li>
                ) : null}
                <li>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleLogout}
                    className="w-full rounded px-4 py-3.5 text-left text-base text-white/70 hover:bg-white/5 disabled:opacity-50"
                  >
                    {logoutLabel}
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block rounded px-4 py-3.5 text-base font-medium bg-brand-green text-brand-black hover:bg-brand-green/90"
                  >
                    {loginLabel}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login?tab=register"
                    onClick={() => setOpen(false)}
                    className="block rounded px-4 py-3.5 text-base text-white border border-white/20 hover:border-brand-green hover:text-brand-green"
                  >
                    {registerLabel}
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="mt-6 pt-4 border-t border-white/10 shrink-0">
            <span className="brand-section-label mb-2 block">Language</span>
            <div className="inline-flex rounded border border-white/15 overflow-hidden text-sm font-mono">
              <button
                type="button"
                onClick={() => switchLocale("nl")}
                className={cn(
                  "min-h-11 px-5 py-2 transition-colors",
                  locale === "nl"
                    ? "bg-brand-green text-brand-black"
                    : "text-white/70 hover:text-white"
                )}
              >
                NL
              </button>
              <button
                type="button"
                onClick={() => switchLocale("en")}
                className={cn(
                  "min-h-11 px-5 py-2 transition-colors",
                  locale === "en"
                    ? "bg-brand-green text-brand-black"
                    : "text-white/70 hover:text-white"
                )}
              >
                EN
              </button>
            </div>
          </div>
        </nav>
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-drawer"
        onClick={() => setOpen((v) => !v)}
        className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded border border-white/15 text-white hover:text-brand-green hover:border-brand-green/50 transition-colors"
      >
        <span className="sr-only">Menu</span>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {open ? (
            <>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </>
          ) : (
            <>
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </>
          )}
        </svg>
      </button>

      {mounted && drawer ? createPortal(drawer, document.body) : null}
    </>
  );
}
