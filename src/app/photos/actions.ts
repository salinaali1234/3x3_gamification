"use server";

import { revalidatePath } from "next/cache";
import {
  PHOTOS_PER_SESSION,
  canUserUploadPhoto,
  uploadPhoto,
} from "@/lib/data/photo-service";
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
  if (!(await canUserUploadPhoto(user.id))) {
    throw new Error(`photo_limit:${PHOTOS_PER_SESSION}`);
  }

  const result = await uploadPhoto(user.id, imageDataUrl, caption, hashtag);
  if (!result.ok) {
    if (result.error === "photo_limit") {
      throw new Error(`photo_limit:${PHOTOS_PER_SESSION}`);
    }
    throw new Error(result.error);
  }

  await evaluateBadges(user.id);
  revalidatePath("/photos");
  revalidatePath("/profile");
  revalidatePath("/admin/photos");
}
