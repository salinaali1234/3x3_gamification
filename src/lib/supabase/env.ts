/**
 * Reads Supabase credentials from the environment.
 * Supports legacy `anon` key and newer publishable key naming.
 * @see https://supabase.com/docs/guides/getting-started/api-keys
 */
export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
}

export function getSupabaseAnonKey(): string | undefined {
  const legacy = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const publishable =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  return legacy || publishable || undefined;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}
