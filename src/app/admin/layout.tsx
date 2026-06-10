import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/session";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const items = [
    { href: "/admin", label: t.admin.title, exact: true },
    { href: "/admin/participants", label: t.admin.participants },
    { href: "/admin/challenges", label: t.admin.challenges },
    { href: "/admin/qr-codes", label: t.admin.codes },
    { href: "/admin/photos", label: t.admin.photos },
    { href: "/admin/rewards", label: t.admin.rewards },
    { href: "/admin/redemptions", label: t.admin.redemptions },
    { href: "/admin/matches", label: t.admin.matches },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3X3 UNITES // admin</div>
      <h1 className="font-display text-5xl">{t.admin.title}</h1>

      <nav className="mt-6 flex flex-wrap gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="whitespace-nowrap rounded-full px-3 py-1 text-sm text-white/70 hover:text-brand-green hover:bg-white/5"
          >
            {it.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
