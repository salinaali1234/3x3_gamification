import type { Profile, Role } from "@/lib/data/types";
import { createSupabaseServerClient } from "./server";

type DbProfileRow = {
  id: string;
  cm_ticket_id: string | null;
  display_name: string;
  email: string;
  avatar_color: string;
  role: Role;
  created_at: string;
};

export function mapDbProfile(row: DbProfileRow): Profile {
  return {
    id: row.id,
    cmTicketId: row.cm_ticket_id ?? null,
    displayName: row.display_name,
    email: row.email,
    avatarColor: row.avatar_color,
    role: row.role,
    createdAt: row.created_at,
  };
}

export async function getProfileByAuthId(
  userId: string
): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, cm_ticket_id, display_name, email, avatar_color, role, created_at"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapDbProfile(data as DbProfileRow);
}

export async function updateDisplayNameDb(
  userId: string,
  displayName: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "not_configured" };

  const trimmed = displayName.trim();
  if (trimmed.length < 2) return { ok: false, error: "name_too_short" };
  if (trimmed.length > 40) return { ok: false, error: "name_too_long" };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: trimmed })
    .eq("id", userId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
