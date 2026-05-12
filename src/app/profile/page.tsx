import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import {
  getBadgeById,
  getRewardById,
  totalPoints,
  userBadgesFor,
  userClaims,
} from "@/lib/data/store";
import { BadgeSticker } from "@/components/ui/badge-sticker";
import { Avatar } from "@/components/ui/avatar";
import { SectionLabel } from "@/components/ui/section-label";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const badges = userBadgesFor(user.id)
    .map((ub) => getBadgeById(ub.badgeId))
    .filter(Boolean);
  const claims = userClaims(user.id);
  const points = totalPoints(user.id);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3x3 unites // profile</div>
      <h1 className="font-display text-5xl">{t.profile.title}</h1>

      <div className="mt-8 flex items-center gap-4">
        <Avatar name={user.displayName} color={user.avatarColor} size="xl" />
        <div>
          <div className="font-display text-3xl">{user.displayName}</div>
          <div className="text-sm text-white/60 font-mono">{user.email}</div>
          <div className="mt-2 text-sm text-white/60">
            cm.nl ticket: <span className="font-mono">{user.cmTicketId}</span>
          </div>
          <div className="mt-2 font-display text-2xl text-brand-green">
            {points} pts
          </div>
        </div>
      </div>

      <section className="mt-10">
        <SectionLabel number="01" className="mb-4">
          {t.profile.displayName}
        </SectionLabel>
        <ProfileForm
          userId={user.id}
          initialName={user.displayName}
          dict={t}
        />
      </section>

      <section className="mt-10">
        <SectionLabel number="02" className="mb-4">
          {t.profile.yourBadges}
        </SectionLabel>
        {badges.length === 0 ? (
          <p className="text-white/60 text-sm">{t.common.noResults}</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {badges.map((b) =>
              b ? (
                <BadgeSticker key={b.id} badge={b} locale={locale} size="md" />
              ) : null
            )}
          </div>
        )}
      </section>

      <section className="mt-10">
        <SectionLabel number="03" className="mb-4">
          {t.profile.claimedRewards}
        </SectionLabel>
        {claims.length === 0 ? (
          <p className="text-white/60 text-sm">{t.common.noResults}</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {claims.map((c) => {
              const rw = getRewardById(c.rewardId);
              if (!rw) return null;
              return (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.02] p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{rw.emoji}</span>
                    <div>
                      <div className="font-medium">{rw.name[locale]}</div>
                      <div className="font-mono text-xs text-brand-green">
                        {c.voucherCode}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-white/40 font-mono">
                    {new Date(c.claimedAt).toLocaleDateString(locale)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
