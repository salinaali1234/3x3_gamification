import Image from "next/image";
import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  getProfileById,
  listPhotos,
  photoLikeCount,
} from "@/lib/data/store";

export default async function AdminPhotos() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const t = getDictionary(locale);
  const photos = listPhotos().map((p) => ({
    ...p,
    likes: photoLikeCount(p.id),
    userName: getProfileById(p.userId)?.displayName ?? "Unknown",
  }));
  const sorted = [...photos].sort((a, b) => b.likes - a.likes);
  const winner = sorted[0];

  return (
    <div className="space-y-6">
      {winner ? (
        <div className="rounded-md border border-brand-green/40 bg-brand-green/5 p-5">
          <div className="brand-section-label !text-brand-green mb-1">
            {locale === "nl" ? "Huidige winnaar" : "Current winner"}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded">
              <Image
                src={winner.imageUrl}
                alt={winner.caption}
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <div className="font-display text-2xl">{winner.caption}</div>
              <div className="text-sm text-white/70">
                {winner.userName} · {winner.likes} {t.photo.likes}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sorted.map((p) => (
          <div
            key={p.id}
            className="rounded-md border border-white/10 overflow-hidden bg-white/[0.02]"
          >
            <div className="relative aspect-square">
              <Image
                src={p.imageUrl}
                alt={p.caption}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="p-3 text-sm">
              <div className="truncate font-medium">{p.caption}</div>
              <div className="text-xs text-white/50 font-mono mt-0.5">
                {p.userName}
              </div>
              <div className="mt-2 flex justify-between text-xs">
                <span className="font-mono text-white/40">#{p.hashtag}</span>
                <span className="text-brand-orange">♥ {p.likes}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
