import Link from "next/link";
import { cookies } from "next/headers";
import type { Profile } from "@/lib/data/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { totalPoints } from "@/lib/data/store";
import { LocaleSwitcher } from "./locale-switcher";
import { UserMenu } from "./user-menu";
import { Logo3x3 } from "./logo";
import { MobileNav } from "./mobile-nav";

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
    { href: "/map", label: t.nav.map },
    { href: "/schedule", label: t.nav.schedule },
    { href: "/wheel", label: t.nav.wheel },
    { href: "/scan", label: t.nav.codes },
    { href: "/photos", label: t.nav.photos },
    { href: "/leaderboard", label: t.nav.leaderboard },
    { href: "/rewards", label: t.nav.rewards },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-black/90 backdrop-blur supports-[backdrop-filter]:bg-brand-black/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 sm:gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="3x3 Unites home"
          className="flex shrink-0 items-center gap-2 group"
        >
          <Logo3x3 className="h-7 sm:h-8 w-auto text-brand-white group-hover:text-brand-green transition-colors" />
        </Link>

        <nav
          aria-label="Main"
          className="hidden lg:flex items-center gap-1 text-sm font-medium"
        >
          {navItems.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="px-3 py-2 rounded text-white/70 hover:text-brand-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
            >
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
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
          <div className="hidden md:contents">
            <LocaleSwitcher current={locale} />
          </div>
          <UserMenu user={user} locale={locale} />
          <MobileNav
            items={navItems}
            locale={locale}
            user={user}
            points={user ? points : null}
            pointsLabel={t.common.pointsShort}
            faqHref="/faq"
            faqLabel={t.nav.faq}
            rulesHref="/rules"
            rulesLabel={t.nav.rules}
            profileLabel={t.nav.profile}
            dashboardLabel="Dashboard"
            adminLabel={t.nav.admin}
            loginLabel={t.nav.login}
            registerLabel={t.login.tabRegister}
            logoutLabel={t.nav.logout}
          />
        </div>
      </div>
    </header>
  );
}
