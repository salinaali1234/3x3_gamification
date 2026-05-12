export const LOCALES = ["nl", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "nl";

export function getLocaleFromCookieValue(value: string | undefined): Locale {
  if (value === "nl" || value === "en") return value;
  return DEFAULT_LOCALE;
}
