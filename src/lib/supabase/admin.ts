import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "./env";

/**
 * Service-role client for trusted server-only code (webhooks, admin jobs).
 * Never import this from Client Components or expose the key to the browser.
 */
export function createSupabaseServiceRoleClient() {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;

  const options: Parameters<typeof createClient>[2] = {
    auth: { persistSession: false, autoRefreshToken: false },
  };

  if (typeof window === "undefined") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ws = require("ws") as typeof WebSocket;
      options.realtime = { transport: ws };
    } catch {
      // ws optional — REST-only usage still works in Node 22+
    }
  }

  return createClient(url, key, options);
}
