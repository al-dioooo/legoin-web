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

// Pages that only call notFound(): a 404 has no other-language version.
const NEVER_RENDERS = new Set(["src/app/[lang]/[...rest]/page.tsx"]);

// The root layout can't see the path, so each page has to set its own.
test("every page sets its own hreflang alternates", () => {
  const pages = globSync("src/app/**/page.tsx");
  expect(pages.length).toBeGreaterThan(0);
  for (const page of pages) {
    if (NEVER_RENDERS.has(page)) continue;
    expect(readFileSync(page, "utf8"), page).toContain("languageAlternates(");
  }
});

// A route param such as a scan id is only known at request time, so metadata
// that reads it has to be marked as intended; see `url-metadata.tsx`.
test("pages whose metadata reads params render the marker", () => {
  const pages = globSync("src/app/**/page.tsx");
  let checked = 0;
  for (const page of pages) {
    const source = readFileSync(page, "utf8");
    const start = source.indexOf("export async function generateMetadata");
    if (start === -1) continue;
    const metadata = source.slice(start, source.indexOf("\n}\n", start));
    if (!metadata.includes("params")) continue;
    checked++;
    const body = source.slice(source.indexOf("export default"));
    expect(body, page).toContain("<UrlMetadataMarker />");
  }
  expect(checked).toBeGreaterThan(0);
});
