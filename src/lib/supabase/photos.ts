import type { Photo } from "@/lib/data/types";
import { PHOTOS_PER_SESSION } from "@/lib/data/store";
import { getSupabaseUrl, isSupabaseConfigured } from "./env";
import { createSupabaseServerClient } from "./server";

export { PHOTOS_PER_SESSION };

function publicStorageUrl(storagePath: string): string {
  const base = getSupabaseUrl();
  if (!base) return storagePath;
  return `${base}/storage/v1/object/public/festival-photos/${storagePath}`;
}

function mapDbPhoto(row: {
  id: string;
  user_id: string;
  storage_path: string;
  caption: string | null;
  hashtag: string | null;
  created_at: string;
}): Photo {
  const path = row.storage_path;
  const imageUrl = path.startsWith("http") || path.startsWith("data:")
    ? path
    : publicStorageUrl(path);
  return {
    id: row.id,
    userId: row.user_id,
    imageUrl,
    caption: row.caption ?? "",
    hashtag: row.hashtag ?? "3x3unites",
    createdAt: row.created_at,
  };
}

export async function getUserPhotoCountDb(userId: string): Promise<number | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { count, error } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) return null;
  return count ?? 0;
}

export async function canUploadPhotoDb(userId: string): Promise<boolean | null> {
  const count = await getUserPhotoCountDb(userId);
  if (count === null) return null;
  return count < PHOTOS_PER_SESSION;
}

export async function listPhotosDb(userId?: string): Promise<Photo[] | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  let query = supabase
    .from("photos")
    .select("id, user_id, storage_path, caption, hashtag, created_at")
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error || !data) return null;
  return data.map(mapDbPhoto);
}

function parseDataUrl(imageDataUrl: string) {
  const match = imageDataUrl.match(/^data:(image\/[\w+]+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1]!;
  const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
  return { mime, ext, buffer: Buffer.from(match[2]!, "base64") };
}

export async function uploadPhotoDb(
  userId: string,
  imageDataUrl: string,
  caption: string,
  hashtag: string
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "not_configured" };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "no_client" };

  const count = await getUserPhotoCountDb(userId);
  if (count !== null && count >= PHOTOS_PER_SESSION) {
    return { ok: false, error: "photo_limit" };
  }

  const parsed = parseDataUrl(imageDataUrl);
  if (!parsed) return { ok: false, error: "bad_image" };

  const storagePath = `${userId}/${crypto.randomUUID()}.${parsed.ext}`;
  const { error: uploadError } = await supabase.storage
    .from("festival-photos")
    .upload(storagePath, parsed.buffer, {
      contentType: parsed.mime,
      upsert: false,
    });

  if (uploadError) {
    return { ok: false, error: uploadError.message };
  }

  const { data, error } = await supabase.rpc("add_photo", {
    p_storage_path: storagePath,
    p_caption: caption.trim(),
    p_hashtag: hashtag.trim().toLowerCase() || "3x3unites",
  });

  if (error) {
    await supabase.storage.from("festival-photos").remove([storagePath]);
    return { ok: false, error: error.message };
  }

  const result = data as { ok?: boolean; error?: string; id?: string };
  if (!result?.ok) {
    await supabase.storage.from("festival-photos").remove([storagePath]);
    return { ok: false, error: result.error ?? "insert_failed" };
  }

  return { ok: true, id: result.id as string };
}
