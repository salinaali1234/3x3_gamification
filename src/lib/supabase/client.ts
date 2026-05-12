"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "./env";

/**
 * Supabase client for Client Components (singleton inside the browser).
 * Returns `null` when env vars are missing.
 */
export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(getSupabaseUrl()!, getSupabaseAnonKey()!);
}
