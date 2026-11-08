// @vitest-environment node
import { expect, test } from "vitest";
import { fill, formatDate, plural, pluralParts } from "@/i18n/format";

test("fill puts values into named placeholders and leaves unknown ones", () => {
  expect(fill("IDEA {index}/{total}", { index: 1, total: 3 })).toBe("IDEA 1/3");
  expect(fill("{name} at {step}", { name: "LEGO Red" })).toBe(
    "LEGO Red at {step}",
  );
});

test("plural follows each language's rules", () => {
  const pieces = { one: "{count} piece", other: "{count} pieces" };
  expect(plural(pieces, 1, "en")).toBe("1 piece");
  expect(plural(pieces, 0, "en")).toBe("0 pieces");
  // Indonesian has no singular form.
  expect(plural(pieces, 1, "id")).toBe("1 pieces");
});

test("pluralParts gives the words around the count", () => {
  const pieces = { one: "{count} piece", other: "{count} pieces" };
  expect(pluralParts(pieces, 8, "en")).toEqual(["", " pieces"]);
  expect(pluralParts(pieces, 1, "en")).toEqual(["", " piece"]);
  expect(
    pluralParts({ one: "only {count}!", other: "{count} left" }, 1, "en"),
  ).toEqual(["only ", "!"]);
  expect(pluralParts({ one: "a piece", other: "{count}" }, 1, "en")).toBeNull();
});

test("formatDate writes the date and time the way each language does", () => {
  const scanned = "2026-10-26T11:20:00.000Z";
  const jakarta = { timeZone: "Asia/Jakarta" };
  expect(formatDate(scanned, "en", jakarta)).toBe(
    "October 26, 2026 at 6:20 PM",
  );
  expect(formatDate(scanned, "id", jakarta)).toBe(
    "26 Oktober 2026 pukul 18.20",
  );
  // The same moment, read elsewhere.
  expect(formatDate(new Date(scanned), "en", { timeZone: "UTC" })).toBe(
    "October 26, 2026 at 11:20 AM",
  );
});

test("formatDate gives back what isn't a date", () => {
  expect(formatDate("yesterday", "en")).toBe("yesterday");
});
