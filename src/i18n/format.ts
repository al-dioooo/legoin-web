import { LOCALE_TAGS, type Locale } from "@/i18n/locales";

/**
 * Dictionaries hold plain strings only, so any part of them can be passed to a
 * Client Component. Values go into `{name}` placeholders; counts pick a plural form.
 */
export type Plural = { one: string; other: string };

export function fill(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}

/** "1 piece" / "8 pieces", by the language's plural rules; `{count}` is filled in. */
export function plural(message: Plural, count: number, locale: Locale) {
  const form = new Intl.PluralRules(LOCALE_TAGS[locale]).select(count);
  return fill(form === "one" ? message.one : message.other, { count });
}
