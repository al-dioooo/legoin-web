// @vitest-environment node
import { expect, test } from "vitest";
import { fill, plural } from "@/i18n/format";

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
