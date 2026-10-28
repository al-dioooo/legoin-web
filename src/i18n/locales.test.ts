// @vitest-environment node
import { expect, test } from "vitest";
import {
  defaultLocaleRedirect,
  hasLocale,
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
