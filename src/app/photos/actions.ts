"use server";

import { revalidatePath } from "next/cache";
import { addPhoto, togglePhotoLike } from "@/lib/data/store";
import { evaluateBadges } from "@/lib/award-points";
import { requireUser } from "@/lib/session";

export async function addPhotoAction({
  caption,
  hashtag,
}: {
  caption: string;
  hashtag: string;
}) {
  const user = await requireUser();
  const id = `photo-${Date.now()}`;
  addPhoto({
    id,
    userId: user.id,
    imageUrl: `https://picsum.photos/seed/${id}/640/640`,
    caption: caption.trim(),
    hashtag: hashtag.trim().toLowerCase() || "3x3unites",
    createdAt: new Date().toISOString(),
  });
  evaluateBadges(user.id);
  revalidatePath("/photos");
  revalidatePath("/profile");
}

export async function togglePhotoLikeAction(photoId: string) {
  const user = await requireUser();
  togglePhotoLike(user.id, photoId);
  revalidatePath("/photos");
}
