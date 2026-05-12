"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { addPhotoAction, togglePhotoLikeAction } from "./actions";

type PhotoCard = {
  id: string;
  imageUrl: string;
  caption: string;
  hashtag: string;
  userName: string;
  avatarColor: string;
  likes: number;
};

export function PhotoWall({
  photos,
  hashtags,
  likedIds,
  locale,
  dict,
  isLoggedIn,
}: {
  photos: PhotoCard[];
  hashtags: string[];
  likedIds: string[];
  locale: Locale;
  dict: Dictionary;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [hashtag, setHashtag] = useState("3x3unites");
  const [isPending, startTransition] = useTransition();
  const likedSet = new Set(likedIds);

  const filtered = filter ? photos.filter((p) => p.hashtag === filter) : photos;

  function like(photoId: string) {
    if (!isLoggedIn) return;
    startTransition(async () => {
      await togglePhotoLikeAction(photoId);
      router.refresh();
    });
  }

  function upload() {
    if (!isLoggedIn) return;
    startTransition(async () => {
      await addPhotoAction({ caption, hashtag });
      setCaption("");
      router.refresh();
    });
  }

  return (
    <div className="mt-8">
      {isLoggedIn ? (
        <div className="mb-6 rounded-md border border-brand-green/40 bg-brand-green/5 p-4">
          <div className="brand-section-label !text-brand-green mb-2">
            {dict.photo.upload}
          </div>
          <p className="text-xs text-white/50 mb-3">
            {locale === "nl"
              ? "Mockup: een placeholder afbeelding wordt automatisch toegevoegd."
              : "Mockup: a placeholder image gets attached automatically."}
          </p>
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
              onChange={(e) => setHashtag(e.target.value.replace(/[^a-z0-9_]/gi, "").toLowerCase())}
              placeholder="hashtag"
              className="rounded border border-white/15 bg-brand-black px-3 py-2 text-sm font-mono focus:border-brand-green focus:outline-none"
            />
          </div>
          <div className="mt-3">
            <Button onClick={upload} disabled={isPending || !hashtag}>
              {isPending ? "..." : dict.photo.upload}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setFilter(null)}
          className={`rounded-full px-3 py-1 text-xs font-mono uppercase tracking-wider border ${
            !filter ? "bg-brand-green text-brand-black border-brand-green" : "border-white/15 text-white/60 hover:text-white"
          }`}
        >
          {dict.photo.filterAll}
        </button>
        {hashtags.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => setFilter(h)}
            className={`rounded-full px-3 py-1 text-xs font-mono uppercase tracking-wider border ${
              filter === h
                ? "bg-brand-green text-brand-black border-brand-green"
                : "border-white/15 text-white/60 hover:text-white"
            }`}
          >
            #{h}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const isLiked = likedSet.has(p.id);
          return (
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
                <div className="flex items-center gap-2 mb-2">
                  <Avatar name={p.userName} color={p.avatarColor} size="sm" />
                  <span className="text-sm">{p.userName}</span>
                </div>
                <p className="text-sm text-white/80">{p.caption}</p>
                <div className="mt-1 text-xs text-white/40 font-mono">
                  #{p.hashtag}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => like(p.id)}
                    disabled={!isLoggedIn || isPending}
                    className={`flex items-center gap-1 text-sm transition-colors ${
                      isLiked ? "text-brand-orange" : "text-white/60 hover:text-brand-orange"
                    } disabled:opacity-50`}
                  >
                    <span className="text-lg">{isLiked ? "♥" : "♡"}</span>
                    <span className="font-mono">{p.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
