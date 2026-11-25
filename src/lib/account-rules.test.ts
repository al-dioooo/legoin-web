import { expect, test } from "vitest";
import {
  isEmail,
  normalizeEmail,
  passwordProblem,
  safeNext,
} from "@/lib/account-rules";

test("emails are trimmed and lowercased, and need a name, an @ and a dotted domain", () => {
  expect(normalizeEmail("  Ana@Example.COM ")).toBe("ana@example.com");
  expect(isEmail("Ana@Example.com ")).toBe(true);
  for (const bad of [
    "",
    "ana",
    "ana@",
    "@example.com",
    "ana@example",
    "a b@c.d",
  ]) {
    expect(isEmail(bad), bad).toBe(false);
  }
  expect(isEmail(`${"a".repeat(243)}@example.com`)).toBe(false);
  expect(isEmail(`${"a".repeat(242)}@example.com`)).toBe(true);
});

test("a new password has 8 to 128 characters, counted as the API counts them", () => {
  expect(passwordProblem("1234567")).toBe("short");
  expect(passwordProblem("12345678")).toBeUndefined();
  expect(passwordProblem("x".repeat(128))).toBeUndefined();
  expect(passwordProblem("x".repeat(129))).toBe("long");
  // Seven emoji are seven characters, though fourteen UTF-16 units.
  expect(passwordProblem("🧱".repeat(7))).toBe("short");
  expect(passwordProblem("🧱".repeat(128))).toBeUndefined();
});

test("logging in only needs a password, not a long one", () => {
  expect(passwordProblem("short", { forLogIn: true })).toBeUndefined();
  expect(passwordProblem("", { forLogIn: true })).toBe("short");
  expect(passwordProblem("x".repeat(129), { forLogIn: true })).toBe("long");
});

test("next is kept only when it's a path on this site", () => {
  const fallback = "/en/scan";
  expect(safeNext("/en/history", fallback)).toBe("/en/history");
  expect(
    safeNext("/id/scan/demo-desk/ideas?theme=animals#idea-2", fallback),
  ).toBe("/id/scan/demo-desk/ideas?theme=animals#idea-2");
  for (const bad of [
    null,
    undefined,
    "",
    "history",
    "//evil.example/en",
    "/\\evil.example",
    "https://evil.example/en",
    "javascript:alert(1)",
    "/en/login",
    "/id/register?next=/en/scan",
  ]) {
    expect(safeNext(bad, fallback), String(bad)).toBe(fallback);
  }
});
