// @vitest-environment node
import { expect, test } from "vitest";
import { en } from "@/i18n/dictionaries/en";
import { id } from "@/i18n/dictionaries/id";
import { plural } from "@/i18n/format";

/** Every leaf path with its kind, e.g. "home.tape: array of 4". */
function shape(value: unknown, path = ""): string[] {
  if (Array.isArray(value)) return [`${path}: array of ${value.length}`];
  if (typeof value === "function") return [`${path}: function`];
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      shape(child, path ? `${path}.${key}` : key),
    );
  }
  return [`${path}: ${typeof value}`];
}

test("Indonesian matches English key for key, list lengths included", () => {
  expect(shape(id)).toEqual(shape(en));
});

test("no copy is left empty", () => {
  const strings = (value: unknown): string[] =>
    typeof value === "string"
      ? [value]
      : value && typeof value === "object"
        ? Object.values(value).flatMap(strings)
        : [];
  for (const text of [...strings(en), ...strings(id)]) {
    expect(text.trim()).not.toBe("");
  }
});

test("counts read naturally in each language", () => {
  expect(plural(en.common.missingCount, 1, "en")).toBe("1 part missing");
  expect(plural(en.common.missingCount, 3, "en")).toBe("3 parts missing");
  expect(plural(id.common.missingCount, 3, "id")).toBe("Kurang 3 part");
});

test("dictionaries are plain data, so they can go to Client Components", () => {
  expect(JSON.parse(JSON.stringify(en))).toEqual(en);
  expect(JSON.parse(JSON.stringify(id))).toEqual(id);
});
