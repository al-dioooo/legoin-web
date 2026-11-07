// @vitest-environment node
import { globSync, readFileSync } from "node:fs";
import { expect, test } from "vitest";
import {
  defaultLocaleRedirect,
  hasLocale,
  languageAlternates,
  localizedPath,
} from "@/i18n/locales";

test("only shipped languages count as locales", () => {
  expect(hasLocale("en")).toBe(true);
  expect(hasLocale("id")).toBe(true);
  expect(hasLocale("fr")).toBe(false);
  expect(hasLocale("desain")).toBe(false);
});

test("switching language keeps the page", () => {
  expect(localizedPath("/id/desain", "en")).toBe("/en/desain");
  expect(localizedPath("/en", "id")).toBe("/id");
  expect(localizedPath("/en/", "id")).toBe("/id");
});

test("paths without a language go to English", () => {
  expect(defaultLocaleRedirect("/")).toBe("/en");
  expect(defaultLocaleRedirect("/desain")).toBe("/en/desain");
  expect(defaultLocaleRedirect("/id/desain")).toBeNull();
  expect(defaultLocaleRedirect("/en")).toBeNull();
});

test("hreflang alternates point at the same page in each language", () => {
  expect(languageAlternates("/")).toEqual({
    languages: { en: "/en", id: "/id" },
  });
  expect(languageAlternates("/scan/demo-desk")).toEqual({
    languages: { en: "/en/scan/demo-desk", id: "/id/scan/demo-desk" },
  });
});

// The root layout can't see the path, so each page has to set its own.
test("every page sets its own hreflang alternates", () => {
  const pages = globSync("src/app/**/page.tsx");
  expect(pages.length).toBeGreaterThan(0);
  for (const page of pages) {
    expect(readFileSync(page, "utf8"), page).toContain("languageAlternates(");
  }
});
