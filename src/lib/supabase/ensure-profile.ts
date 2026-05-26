import type { SupabaseClient, User } from "@supabase/supabase-js";

/** Creates a profiles row when auth exists but trigger did not run (legacy sign-ups). */
export async function ensureUserProfileForUser(
  supabase: SupabaseClient,
  _user: User
): Promise<void> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", _user.id)
    .maybeSingle();

  if (data) return;

  const { error } = await supabase.rpc("ensure_user_profile");
  if (error) {
    console.error("[ensure_user_profile]", error.message, { userId: _user.id });
  }
}
