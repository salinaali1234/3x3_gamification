import {
  CM_API_BASE,
  getCmApiToken,
  getCmCompletedAtRange,
  getCmEventUuid,
  getCmOrderStatusFilter,
  isCmConfigured,
} from "./env";
import type { CmOrder } from "./types";

const PAGE_SIZE = 20;

function authHeaders(): HeadersInit {
  const token = getCmApiToken()!;
  const scheme = process.env.CM_API_AUTH_SCHEME?.trim() || "Bearer";
  if (scheme.toLowerCase() === "apikey") {
    return {
      apiKey: token,
      "X-TF-PREFERREDLANGUAGEID": "NL",
    };
  }
  return {
    Authorization: `${scheme} ${token}`,
    "X-TF-PREFERREDLANGUAGEID": "NL",
  };
}

/**
 * Fetches all orders for the configured event (paginated).
 * @see https://developers.cm.com/ticketing/reference/get-orders
 */
export async function fetchCmOrders(): Promise<CmOrder[]> {
  if (!isCmConfigured()) {
    throw new Error(
      "CM not configured: set CM_API_TOKEN and CM_EVENT_UUID in .env.local"
    );
  }

  const eventUuid = getCmEventUuid()!;
  const status = getCmOrderStatusFilter();
  const range = getCmCompletedAtRange();
  const all: CmOrder[] = [];
  let skip = 0;

  while (true) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (range) params.set("completed_at_range", range);

    const url = `${CM_API_BASE}/events/${eventUuid}/orders?${params}`;
    const res = await fetch(url, {
      headers: {
        ...authHeaders(),
        "X-TF-PAGINATION-SKIP": String(skip),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`CM API ${res.status}: ${body.slice(0, 300)}`);
    }

    const raw = await res.text();
    let page: CmOrder[];
    try {
      page = JSON.parse(raw) as CmOrder[];
    } catch {
      throw new Error("CM API returned non-JSON response");
    }

    if (!Array.isArray(page) || page.length === 0) break;
    all.push(...page);

    const totalHeader = res.headers.get("x-tf-pagination-total");
    const total = totalHeader ? Number(totalHeader) : null;
    skip += PAGE_SIZE;
    if (page.length < PAGE_SIZE) break;
    if (total !== null && !Number.isNaN(total) && skip >= total) break;
    if (skip > 10_000) break;
  }

  return all;
}

/** Quick connectivity check without importing all pages. */
export async function testCmConnection(): Promise<{
  ok: boolean;
  status: number;
  message: string;
}> {
  if (!isCmConfigured()) {
    return { ok: false, status: 0, message: "CM_API_TOKEN or CM_EVENT_UUID missing" };
  }
  const eventUuid = getCmEventUuid()!;
  const url = `${CM_API_BASE}/events/${eventUuid}/orders`;
  const res = await fetch(url, {
    headers: {
      ...authHeaders(),
      "X-TF-PAGINATION-SKIP": "0",
    },
    cache: "no-store",
  });
  if (res.ok) {
    return { ok: true, status: res.status, message: "Connected to CM Ticketing API" };
  }
  const body = await res.text();
  return {
    ok: false,
    status: res.status,
    message: body.slice(0, 200) || res.statusText,
  };
}
