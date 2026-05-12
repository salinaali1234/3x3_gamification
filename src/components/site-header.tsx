import Link from "next/link";
import { cookies } from "next/headers";
import type { Profile } from "@/lib/data/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { totalPoints } from "@/lib/data/store";
import { LocaleSwitcher } from "./locale-switcher";
import { UserMenu } from "./user-menu";
import { Logo3x3 } from "./logo";

export async function SiteHeader({
  locale,
  user,
}: {
  locale: Locale;
  user: Profile | null;
}) {
  await cookies();
  const t = getDictionary(locale);
  const points = user ? totalPoints(user.id) : 0;

  const navItems = [
    { href: "/", label: t.nav.home },
    { href: "/journey", label: t.nav.journey },
    { href: "/challenges", label: t.nav.challenges },
    { href: "/scan", label: t.nav.scan },
    { href: "/photos", label: t.nav.photos },
    { href: "/leaderboard", label: t.nav.leaderboard },
    { href: "/rewards", label: t.nav.rewards },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-black/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo3x3 className="h-8 w-auto text-brand-white group-hover:text-brand-green transition-colors" />
        </Link>
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          {navItems.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="px-3 py-2 rounded text-white/70 hover:text-brand-white hover:bg-white/5 transition-colors"
            >
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-brand-green/40 bg-brand-green/10 pl-3 pr-1 py-1">
              <span className="brand-section-label !text-brand-green">
                {t.common.pointsShort}
              </span>
              <span className="font-display text-lg leading-none text-brand-green tabular-nums">
                {points}
              </span>
            </div>
          ) : null}
          <LocaleSwitcher current={locale} />
          <UserMenu user={user} locale={locale} />
        </div>
      </div>
      <MobileNav items={navItems} />
    </header>
  );
}

function MobileNav({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav className="lg:hidden border-t border-white/10 overflow-x-auto">
      <ul className="flex items-center gap-1 px-2 py-1 text-xs">
        {items.map((it) => (
          <li key={it.href}>
            <Link
              href={it.href}
              className="block whitespace-nowrap px-3 py-2 rounded text-white/70 hover:text-brand-white hover:bg-white/5"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
