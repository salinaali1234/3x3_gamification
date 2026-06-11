import { headers } from "next/headers";

/** Optional fixed origin for auth emails (set NEXT_PUBLIC_SITE_URL in production). */
export function getSiteUrlFromEnv(): string | null {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!url) return null;
  return url.replace(/\/$/, "");
}

/** Resolve the public site origin for Supabase auth redirect URLs. */
export async function getSiteUrl(): Promise<string> {
  const fromEnv = getSiteUrlFromEnv();
  if (fromEnv) return fromEnv;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;

  return "http://localhost:3000";
}
