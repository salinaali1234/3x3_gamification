"use server";

import { revalidatePath } from "next/cache";
import { addPhoto, canUploadPhoto, PHOTOS_PER_SESSION } from "@/lib/data/store";
import { evaluateBadges } from "@/lib/award-points";
import { requireUser } from "@/lib/session";

export async function addPhotoAction({
  caption,
  hashtag,
  imageDataUrl,
}: {
  caption: string;
  hashtag: string;
  imageDataUrl: string;
}) {
  const user = await requireUser();
  if (!canUploadPhoto(user.id)) {
    throw new Error(`photo_limit:${PHOTOS_PER_SESSION}`);
  }
  const id = `photo-${Date.now()}`;
  addPhoto({
    id,
    userId: user.id,
    imageUrl: imageDataUrl,
    caption: caption.trim(),
    hashtag: hashtag.trim().toLowerCase() || "3x3unites",
    createdAt: new Date().toISOString(),
  });
  evaluateBadges(user.id);
  revalidatePath("/photos");
  revalidatePath("/profile");
  revalidatePath("/admin/photos");
}
