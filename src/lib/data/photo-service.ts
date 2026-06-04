import {
  PHOTOS_PER_SESSION,
  addPhoto as memAddPhoto,
  canUploadPhoto as memCanUploadPhoto,
  listPhotos as memListPhotos,
  listPhotosForUser as memListPhotosForUser,
  userPhotoCount as memUserPhotoCount,
} from "./store";
import type { Photo } from "./types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  canUploadPhotoDb,
  getUserPhotoCountDb,
  listPhotosDb,
  uploadPhotoDb,
} from "@/lib/supabase/photos";

export { PHOTOS_PER_SESSION };

export async function getUserPhotoCount(userId: string): Promise<number> {
  if (isSupabaseConfigured()) {
    const count = await getUserPhotoCountDb(userId);
    if (count !== null) return count;
  }
  return memUserPhotoCount(userId);
}

export async function canUserUploadPhoto(userId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const allowed = await canUploadPhotoDb(userId);
    if (allowed !== null) return allowed;
  }
  return memCanUploadPhoto(userId);
}

export async function listPhotosForDisplay(userId?: string): Promise<Photo[]> {
  if (isSupabaseConfigured()) {
    const rows = await listPhotosDb(userId);
    if (rows) return rows;
  }
  return userId ? memListPhotosForUser(userId) : memListPhotos();
}

export async function uploadPhoto(
  userId: string,
  imageDataUrl: string,
  caption: string,
  hashtag: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (isSupabaseConfigured()) {
    const result = await uploadPhotoDb(userId, imageDataUrl, caption, hashtag);
    if (result.ok || result.error !== "not_configured") {
      return result.ok ? { ok: true } : { ok: false, error: result.error };
    }
  }

  if (!memCanUploadPhoto(userId)) {
    return { ok: false, error: "photo_limit" };
  }

  memAddPhoto({
    id: `photo-${Date.now()}`,
    userId,
    imageUrl: imageDataUrl,
    caption: caption.trim(),
    hashtag: hashtag.trim().toLowerCase() || "3x3unites",
    createdAt: new Date().toISOString(),
  });
  return { ok: true };
}
