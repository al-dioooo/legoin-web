/* Shared by the specs. They find elements by role, name and label only, with
 * names taken from the dictionaries, so the copy lives in one place and every
 * spec can run in both languages (ADR-0007 in legoin-docs).
 */
import { en } from "../src/i18n/dictionaries/en";
import { id } from "../src/i18n/dictionaries/id";
import type { Locale } from "../src/i18n/locales";

export { LOCALES } from "../src/i18n/locales";

const DICTIONARIES = { en, id };

export function copyFor(locale: Locale) {
  return DICTIONARIES[locale];
}

/**
 * An accessible name that starts with `text`, such as the "See steps" link,
 * whose full name is "See steps: Little race car".
 */
export function startsWith(text: string) {
  return new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
}
