import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import { getProfileById } from "@/lib/data/store";
import {
  PHOTOS_PER_SESSION,
  getUserPhotoCount,
  listPhotosForDisplay,
} from "@/lib/data/photo-service";
import { PhotoWall } from "./photo-wall";

export default async function PhotosPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isLeader = user.role === "admin";
  const source = await listPhotosForDisplay(isLeader ? undefined : user.id);
  const photoCount = await getUserPhotoCount(user.id);

  const photos = source.map((p) => {
    const profile = getProfileById(p.userId);
    return {
      id: p.id,
      imageUrl: p.imageUrl,
      caption: p.caption,
      hashtag: p.hashtag,
      createdAt: p.createdAt,
      userName: profile?.displayName ?? "Unknown",
    };
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3X3 UNITES // photos</div>
      <h1 className="font-display text-5xl sm:text-6xl">
        {isLeader ? t.photo.leaderTitle : t.photo.title}
      </h1>
      <p className="mt-3 text-white/70 max-w-2xl">
        {isLeader ? t.photo.leaderSubtitle : t.photo.subtitle}
      </p>
      {isLeader ? (
        <p className="mt-2 text-sm">
          <Link href="/admin/photos" className="text-brand-green hover:underline">
            {t.photo.adminGalleryLink} →
          </Link>
        </p>
      ) : null}

      <PhotoWall
        photos={photos}
        locale={locale}
        dict={t}
        isLoggedIn
        isLeaderView={isLeader}
        photosRemaining={Math.max(0, PHOTOS_PER_SESSION - photoCount)}
        photosLimit={PHOTOS_PER_SESSION}
      />
    </div>
  );
}
