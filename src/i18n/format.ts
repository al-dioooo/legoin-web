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

function pluralTemplate(message: Plural, count: number, locale: Locale) {
  const form = new Intl.PluralRules(LOCALE_TAGS[locale]).select(count);
  return form === "one" ? message.one : message.other;
}

/** "1 piece" / "8 pieces", by the language's plural rules; `{count}` is filled in. */
export function plural(message: Plural, count: number, locale: Locale) {
  return fill(pluralTemplate(message, count, locale), { count });
}

/**
 * The words before and after the count, so the number can be drawn on its own,
 * e.g. on an odometer: ["", " pieces"]. Null when the form has no `{count}`.
 */
export function pluralParts(
  message: Plural,
  count: number,
  locale: Locale,
): [before: string, after: string] | null {
  const template = pluralTemplate(message, count, locale);
  const at = template.indexOf("{count}");
  if (at === -1) return null;
  return [template.slice(0, at), template.slice(at + "{count}".length)];
}

/**
 * A moment for people to read, in the language's own words and order:
 * "October 26, 2026 at 6:20 PM", "26 Oktober 2026 pukul 18.20". Takes an
 * ISO 8601 string such as a scan's `createdAt`. The time is the reader's own
 * unless `timeZone` says otherwise; something that isn't a date comes back as is.
 */
export function formatDate(
  value: string | Date,
  locale: Locale,
  { timeZone }: { timeZone?: string } = {},
) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
    dateStyle: "long",
    timeStyle: "short",
    timeZone,
  }).format(date);
}
