/* Shared by the specs. They find elements by role, name and label only, with
 * names taken from the dictionaries, so the copy lives in one place and every
 * spec can run in both languages (ADR-0007 in legoin-docs).
 */
import { expect, type Page } from "@playwright/test";
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

/** A password that passes the contract's rules, for every test account. */
export const PASSWORD = "baseplate-2x4";

/** A new email each time, so tests never share an account. */
export function newEmail() {
  return `e2e-${crypto.randomUUID()}@example.com`;
}

/**
 * Fills in and sends the log-in or create-account form. It's found by its
 * name, so the other page, which Next may keep hidden after a navigation
 * between them, never matches.
 */
export async function fillAccountForm(
  page: Page,
  locale: Locale,
  mode: "login" | "register",
  email: string,
  password: string,
) {
  const copy = copyFor(locale);
  const form = page.getByRole("form", { name: copy.auth[mode].title });
  await form.getByLabel(copy.auth.email, { exact: true }).fill(email);
  await form.getByLabel(copy.auth.password, { exact: true }).fill(password);
  await form.getByRole("button", { name: copy.auth[mode].submit }).click();
}

/**
 * Makes a fresh account through the form, as a person would, and waits for
 * the scan page it opens. Every page that scans or shows scans needs one
 * (ADR-0011); the mock keeps it in this test's browser only.
 */
export async function signUp(page: Page, locale: Locale = "en") {
  const copy = copyFor(locale);
  const email = newEmail();
  await page.goto(`/${locale}/register`);
  await fillAccountForm(page, locale, "register", email, PASSWORD);
  await expect(
    page.getByRole("heading", { level: 1, name: copy.scan.title }),
  ).toBeVisible();
  return email;
}
