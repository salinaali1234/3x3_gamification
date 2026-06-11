import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getTotalPoints, getUserClaims, getUserBadges } from "@/lib/data/user-game";
import { getRewardById } from "@/lib/data/store";
import { BadgeSticker } from "@/components/ui/badge-sticker";
import { Avatar } from "@/components/ui/avatar";
import { SectionLabel } from "@/components/ui/section-label";
import { ProfileForm } from "./profile-form";
import { ChangePasswordForm } from "./change-password-form";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const badges = await getUserBadges(user.id);
  const claims = await getUserClaims(user.id);
  const points = await getTotalPoints(user.id);
  const passwordEnabled = isSupabaseConfigured();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3X3 UNITES // profile</div>
      <h1 className="font-display text-5xl">{t.profile.title}</h1>

      <div className="mt-8 flex items-center gap-4">
        <Avatar name={user.displayName} color={user.avatarColor} size="xl" />
        <div>
          <div className="font-display text-3xl">{user.displayName}</div>
          <div className="text-sm text-white/60 font-mono">{user.email}</div>
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

      {passwordEnabled ? (
        <section className="mt-10">
          <SectionLabel number="02" className="mb-4">
            {t.profile.changePassword}
          </SectionLabel>
          <p className="mb-4 max-w-md text-sm text-white/60">
            {t.profile.changePasswordHint}
          </p>
          <ChangePasswordForm
            labels={{
              currentPasswordLabel: t.profile.currentPasswordLabel,
              newPasswordLabel: t.profile.newPasswordLabel,
              confirmPasswordLabel: t.profile.confirmPasswordLabel,
              passwordPlaceholder: t.login.passwordPlaceholder,
              showPassword: t.login.showPassword,
              hidePassword: t.login.hidePassword,
              submit: t.profile.changePasswordSubmit,
              submitting: t.profile.changePasswordSubmitting,
              success: t.profile.changePasswordSuccess,
              errorPasswordWeak: t.login.errorPasswordWeak,
              errorPasswordMismatch: t.profile.errorPasswordMismatch,
              errorPasswordSame: t.profile.errorPasswordSame,
              errorWrongCurrentPassword: t.profile.errorWrongCurrentPassword,
              errorAuthFailed: t.login.errorAuthFailed,
            }}
          />
        </section>
      ) : null}

      <section className="mt-10">
        <SectionLabel number="03" className="mb-4">
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
        <SectionLabel number="04" className="mb-4">
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
                  className="flex flex-col gap-2 rounded-md border border-white/10 bg-white/[0.02] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-3xl shrink-0">{rw.emoji}</span>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{rw.name[locale]}</div>
                        <div className="font-mono text-xs text-brand-green break-all">
                          {c.voucherCode}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-white/40 font-mono shrink-0">
                      {new Date(c.claimedAt).toLocaleDateString(locale)}
                    </span>
                  </div>
                  <p className="text-xs text-white/50">
                    {c.redeemedAt ? t.rewards.redeemed : t.rewards.pendingPickup}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
