/** CM Ticketing Partner API — server-only env (never NEXT_PUBLIC_). */

export const CM_API_BASE =
  process.env.CM_API_BASE_URL?.trim() ||
  "https://api.ticketing.cm.com/partnerapi/v1.0";

export function getCmApiToken(): string | undefined {
  return (
    process.env.CM_API_TOKEN?.trim() ||
    process.env.CM_API_KEY?.trim() ||
    undefined
  );
}

export function getCmEventUuid(): string | undefined {
  return process.env.CM_EVENT_UUID?.trim() || undefined;
}

/** Optional: COMPLETED, RELEASED, etc. — check CM dashboard for your event. */
export function getCmOrderStatusFilter(): string | undefined {
  return process.env.CM_ORDER_STATUS?.trim() || "COMPLETED";
}

/**
 * Optional date range for incremental sync: `2026-05-01,2026-05-18`
 * @see https://developers.cm.com/ticketing/reference/get-orders
 */
export function getCmCompletedAtRange(): string | undefined {
  return process.env.CM_SYNC_COMPLETED_AT_RANGE?.trim() || undefined;
}

export function isCmConfigured(): boolean {
  return Boolean(getCmApiToken() && getCmEventUuid());
}
