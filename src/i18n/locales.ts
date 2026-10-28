/** Languages the UI ships in. English is the default; see legoin-docs ADR-0004. */
export const LOCALES = ["en", "id"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** BCP 47 tags for Intl formatting, e.g. numbers: 0.94 vs 0,94. */
export const LOCALE_TAGS: Record<Locale, string> = {
  en: "en-US",
  id: "id-ID",
};

export function hasLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** The same page in another language: swaps or adds the locale prefix. */
export function localizedPath(pathname: string, locale: Locale) {
  const [, first = "", ...rest] = pathname.split("/");
  const tail = hasLocale(first) ? rest : [first, ...rest];
  const path = tail.filter(Boolean).join("/");
  return path ? `/${locale}/${path}` : `/${locale}`;
}

/** Where to send a request that has no locale prefix, or null when it has one. */
export function defaultLocaleRedirect(pathname: string) {
  const [, first = ""] = pathname.split("/");
  return hasLocale(first) ? null : localizedPath(pathname, DEFAULT_LOCALE);
}
