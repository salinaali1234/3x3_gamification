import Image from "next/image";
import { cookies } from "next/headers";
import { getLocaleFromCookieValue } from "@/lib/i18n/config";
import { getProfileById } from "@/lib/data/store";
import { listPhotosForDisplay } from "@/lib/data/photo-service";

export default async function AdminPhotos() {
  const cookieStore = await cookies();
  const locale = getLocaleFromCookieValue(cookieStore.get("locale")?.value);
  const allPhotos = await listPhotosForDisplay();
  const photos = allPhotos.map((p) => ({
    ...p,
    userName: getProfileById(p.userId)?.displayName ?? "Unknown",
  }));
  const sorted = [...photos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-white/60 max-w-2xl">
        {locale === "nl"
          ? "Leader view: alle privé uploads van deelnemers. Geen publieke feed of likes."
          : "Leader view: all private participant uploads. No public feed or likes."}
      </p>

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
              <div className="mt-2 text-xs font-mono text-white/40">#{p.hashtag}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
