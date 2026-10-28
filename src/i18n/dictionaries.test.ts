// @vitest-environment node
import { expect, test } from "vitest";
import { en } from "@/i18n/dictionaries/en";
import { id } from "@/i18n/dictionaries/id";

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
  expect(en.common.missingCount(1)).toBe("1 part missing");
  expect(en.common.missingCount(3)).toBe("3 parts missing");
  expect(id.common.missingCount(3)).toBe("Kurang 3 part");
});
