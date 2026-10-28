import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { hasLocale, type Locale } from "@/i18n/locales";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("@/i18n/dictionaries/en").then((module) => module.en),
  id: () => import("@/i18n/dictionaries/id").then((module) => module.id),
};

/** The language of the current route; unknown prefixes such as /fr are a 404. */
export async function currentLocale(): Promise<Locale> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return locale;
}

/** UI copy for the current route's language. Server Components only. */
export async function getDictionary() {
  return dictionaries[await currentLocale()]();
}
