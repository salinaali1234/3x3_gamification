import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import {
  getProfileById,
  listPhotos,
  photoLikeCount,
  userPhotoLikes,
} from "@/lib/data/store";
import { PhotoWall } from "./photo-wall";

export default async function PhotosPage() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const user = await getCurrentUser();
  const photos = listPhotos().map((p) => {
    const profile = getProfileById(p.userId);
    return {
      ...p,
      userName: profile?.displayName ?? "Unknown",
      avatarColor: profile?.avatarColor ?? "#888",
      likes: photoLikeCount(p.id),
    };
  });
  const liked = user ? new Set(userPhotoLikes(user.id).map((l) => l.photoId)) : new Set<string>();

  const hashtags = Array.from(new Set(photos.map((p) => p.hashtag))).sort();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="brand-section-label mb-2">3x3 unites // photos</div>
      <h1 className="font-display text-5xl sm:text-6xl">{t.photo.title}</h1>
      <p className="mt-3 text-white/70 max-w-2xl">{t.photo.subtitle}</p>

      <PhotoWall
        photos={photos}
        hashtags={hashtags}
        likedIds={Array.from(liked) as string[]}
        locale={locale}
        dict={t}
        isLoggedIn={!!user}
      />
    </div>
  );
}
