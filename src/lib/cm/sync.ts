import { addProfile, getProfileByEmail, listProfiles } from "@/lib/data/store";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { fetchCmOrders } from "./client";
import type { CmOrder, CmSyncResult } from "./types";

const AVATAR_COLORS = [
  "#BEFF00",
  "#FF6701",
  "#00FFFF",
  "#F3EEE4",
  "#9B5DE5",
  "#FF477E",
];

function displayName(order: CmOrder): string {
  const c = order.customer_data;
  const parts = [c?.first_name, c?.last_name].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return c?.email?.split("@")[0] ?? "Participant";
}

function orderEmail(order: CmOrder): string | null {
  const email = order.customer_data?.email?.trim().toLowerCase();
  return email || null;
}

async function upsertToSupabase(order: CmOrder, display: string, email: string) {
  const supabase = createSupabaseServiceRoleClient();
  if (!supabase) return { wrote: false, reason: "no_service_role" as const };

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("cm_ticket_id", order.uuid)
    .maybeSingle();

  if (existing) return { wrote: false, reason: "exists" as const };

  const { data: byEmail } = await supabase
    .from("profiles")
    .select("id, cm_ticket_id")
    .eq("email", email)
    .maybeSingle();

  if (byEmail) {
    await supabase
      .from("profiles")
      .update({ cm_ticket_id: order.uuid, display_name: display })
      .eq("id", byEmail.id);
    return { wrote: true, reason: "updated_email" as const };
  }

  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const { error } = await supabase.from("profiles").insert({
    cm_ticket_id: order.uuid,
    display_name: display,
    email,
    avatar_color: color,
    role: "participant",
    total_points: 0,
  });

  if (error) throw new Error(error.message);
  return { wrote: true, reason: "inserted" as const };
}

function upsertToMemory(order: CmOrder, display: string, email: string) {
  const existing = getProfileByEmail(email);
  if (existing) return false;
  const all = listProfiles();
  addProfile({
    id: `user-cm-${order.uuid.slice(0, 8)}`,
    cmTicketId: order.uuid,
    displayName: display,
    email,
    avatarColor: AVATAR_COLORS[all.length % AVATAR_COLORS.length],
    role: "participant",
    createdAt: new Date().toISOString(),
  });
  return true;
}

/**
 * Pull orders from CM and register participants (Supabase + in-memory mock).
 */
export async function syncParticipantsFromCm(): Promise<CmSyncResult> {
  const orders = await fetchCmOrders();
  const result: CmSyncResult = {
    fetched: orders.length,
    created: 0,
    skipped: 0,
    errors: [],
  };

  for (const order of orders) {
    try {
      const email = orderEmail(order);
      if (!email) {
        result.skipped++;
        continue;
      }
      const display = displayName(order);

      const memoryHad = getProfileByEmail(email);
      const supabaseResult = await upsertToSupabase(order, display, email);
      const memoryCreated = !memoryHad && upsertToMemory(order, display, email);

      if (
        supabaseResult.reason === "exists" &&
        !memoryHad &&
        !memoryCreated
      ) {
        result.skipped++;
        continue;
      }

      if (
        supabaseResult.wrote ||
        memoryCreated ||
        supabaseResult.reason === "updated_email"
      ) {
        result.created++;
      } else {
        result.skipped++;
      }
    } catch (e) {
      result.errors.push(
        `${order.uuid}: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  return result;
}
