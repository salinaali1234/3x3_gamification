"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button } from "@/components/ui/button";
import { addPhotoAction } from "./actions";

type PhotoCard = {
  id: string;
  imageUrl: string;
  caption: string;
  hashtag: string;
  userName?: string;
  createdAt: string;
};

export function PhotoWall({
  photos,
  locale,
  dict,
  isLoggedIn,
  isLeaderView,
  photosRemaining = 3,
  photosLimit = 3,
}: {
  photos: PhotoCard[];
  locale: Locale;
  dict: Dictionary;
  isLoggedIn: boolean;
  isLeaderView?: boolean;
  photosRemaining?: number;
  photosLimit?: number;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [hashtag, setHashtag] = useState("3x3unites");
  const [preview, setPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setPreview(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  const canUpload = photosRemaining > 0;

  function upload() {
    if (!isLoggedIn || !preview || !canUpload) return;
    startTransition(async () => {
      try {
        await addPhotoAction({ caption, hashtag, imageDataUrl: preview });
        setCaption("");
        setPreview(null);
        if (inputRef.current) inputRef.current.value = "";
        router.refresh();
      } catch {
        /* limit or server error */
      }
    });
  }

  return (
    <div className="mt-8">
      {isLeaderView ? (
        <p className="mb-6 rounded-md border border-brand-blue/40 bg-brand-blue/10 px-4 py-3 text-sm text-white/70">
          {dict.photo.leaderViewNote}
        </p>
      ) : null}

      {isLoggedIn && !isLeaderView ? (
        <div className="mb-6 rounded-md border border-brand-green/40 bg-brand-green/5 p-4">
          <div className="brand-section-label !text-brand-green mb-2">
            {dict.photo.upload}
          </div>
          <p className="text-xs text-white/50 mb-2">{dict.photo.privateNote}</p>
          <p className="mb-3 font-mono text-sm text-brand-green">
            {photosRemaining} / {photosLimit} {dict.photo.photosLeft}
          </p>
          {!canUpload ? (
            <p className="mb-3 text-sm text-brand-orange">{dict.photo.limitReached}</p>
          ) : null}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFile}
            className="hidden"
          />
          {preview ? (
            <div className="relative mb-3 aspect-video max-h-64 w-full overflow-hidden rounded border border-white/15">
              <Image
                src={preview}
                alt={dict.photo.upload}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : null}
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={dict.photo.uploadCaption}
              className="sm:col-span-2 rounded border border-white/15 bg-brand-black px-3 py-2 text-sm focus:border-brand-green focus:outline-none"
            />
            <input
              type="text"
              value={hashtag}
              onChange={(e) =>
                setHashtag(e.target.value.replace(/[^a-z0-9_]/gi, "").toLowerCase())
              }
              placeholder="hashtag"
              className="rounded border border-white/15 bg-brand-black px-3 py-2 text-sm font-mono focus:border-brand-green focus:outline-none"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => inputRef.current?.click()}
              variant="outline"
              disabled={!canUpload}
            >
              {preview ? dict.photo.changePhoto : dict.photo.pickPhoto}
            </Button>
            <Button
              onClick={upload}
              disabled={isPending || !preview || !canUpload}
              variant="primary"
            >
              {isPending ? "..." : dict.photo.upload}
            </Button>
          </div>
        </div>
      ) : null}

      {photos.length === 0 ? (
        <div className="rounded-md border border-white/10 bg-white/[0.02] p-10 text-center text-white/50">
          {isLoggedIn ? dict.photo.emptyOwn : dict.photo.loginToUpload}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <div
              key={p.id}
              className="overflow-hidden rounded-md border border-white/10 bg-white/[0.02]"
            >
              <div className="relative aspect-square">
                <Image
                  src={p.imageUrl}
                  alt={p.caption}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-3">
                {isLeaderView && p.userName ? (
                  <div className="text-xs font-mono text-brand-blue mb-1">{p.userName}</div>
                ) : null}
                <p className="text-sm text-white/80">{p.caption || "—"}</p>
                <div className="mt-1 text-xs text-white/40 font-mono">#{p.hashtag}</div>
                <div className="mt-1 text-xs text-white/30">
                  {new Date(p.createdAt).toLocaleString(locale)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
