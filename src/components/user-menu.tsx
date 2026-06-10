"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Profile } from "@/lib/data/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { logoutAction } from "@/app/actions";
import { initials } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function MenuItems({
  user,
  t,
  onClose,
  isPending,
  onLogout,
  itemClassName = "block px-4 py-3 text-base text-white hover:bg-white/5 active:bg-white/10",
}: {
  user: Profile;
  t: ReturnType<typeof getDictionary>;
  onClose: () => void;
  isPending: boolean;
  onLogout: () => void;
  itemClassName?: string;
}) {
  return (
    <>
      <Link href="/profile" role="menuitem" onClick={onClose} className={itemClassName}>
        {t.nav.profile}
      </Link>
      <Link href="/dashboard" role="menuitem" onClick={onClose} className={itemClassName}>
        Dashboard
      </Link>
      {user.role === "admin" ? (
        <Link
          href="/admin"
          role="menuitem"
          onClick={onClose}
          className={cn(itemClassName, "text-brand-green")}
        >
          {t.nav.admin}
        </Link>
      ) : null}
      <button
        type="button"
        role="menuitem"
        disabled={isPending}
        onClick={onLogout}
        className={cn(
          itemClassName,
          "w-full border-t border-white/10 text-left text-white/70"
        )}
      >
        {t.nav.logout}
      </button>
    </>
  );
}

export function UserMenu({
  user,
  locale,
}: {
  user: Profile | null;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const el = buttonRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8,
        right: Math.max(12, window.innerWidth - rect.right),
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    const previous = isMobile ? document.body.style.overflow : "";
    if (isMobile) document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      if (isMobile) document.body.style.overflow = previous;
    };
  }, [open]);

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-brand-green px-4 py-2 text-sm font-medium text-brand-black hover:bg-brand-green/90 transition-colors"
      >
        {t.nav.login}
      </Link>
    );
  }

  const firstName = user.displayName.split(" ")[0];

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
      setOpen(false);
    });
  }

  const linkProps = {
    user,
    t,
    onClose: () => setOpen(false),
    isPending,
    onLogout: handleLogout,
  };

  const mobileDropdown =
    open && mounted && menuPos ? (
      <div
        className="lg:hidden fixed inset-0 z-[95]"
        role="dialog"
        aria-modal="true"
        aria-label="Profile menu"
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/50"
          onClick={() => setOpen(false)}
          aria-label="Close profile menu"
        />
        <div
          className="absolute z-[96] w-[min(calc(100vw-1.5rem),17.5rem)] overflow-hidden rounded-xl border border-white/15 bg-brand-black shadow-2xl"
          style={{ top: menuPos.top, right: menuPos.right }}
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <Avatar name={user.displayName} color={user.avatarColor} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <p className="text-xs text-white/50 truncate">{user.email}</p>
            </div>
          </div>
          <nav role="menu">
            <MenuItems {...linkProps} />
          </nav>
        </div>
      </div>
    ) : null;

  return (
    <div className="relative flex shrink-0 items-center">
      <Link
        href="/profile"
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center rounded-full border p-0.5 transition-colors",
          "border-white/15 hover:border-brand-green/50",
          "pr-1.5 sm:pr-2.5"
        )}
        aria-label={`${t.nav.profile} — ${user.displayName}`}
      >
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full font-display text-sm text-brand-black shrink-0"
          style={{ background: user.avatarColor }}
        >
          {initials(user.displayName)}
        </span>
        <span className="hidden sm:inline max-w-[4.5rem] md:max-w-[5.5rem] truncate pl-1.5 text-sm text-white/80">
          {firstName}
        </span>
      </Link>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
          open
            ? "border-brand-green/60 bg-brand-green/10 text-brand-green"
            : "border-white/15 text-white/60 hover:border-brand-green/50 hover:text-white"
        )}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open ? (
        <nav
          role="menu"
          className="hidden lg:block absolute right-0 top-full z-[60] mt-2 w-52 overflow-hidden rounded-md border border-white/15 bg-brand-black shadow-xl"
        >
          <MenuItems
            {...linkProps}
            itemClassName="block px-4 py-2.5 text-sm text-white hover:bg-white/5"
          />
        </nav>
      ) : null}

      {mobileDropdown ? createPortal(mobileDropdown, document.body) : null}
    </div>
  );
}
