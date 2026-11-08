// @vitest-environment node
import { globSync, readFileSync } from "node:fs";
import { expect, test } from "vitest";

/** A module path into src/lib/mock, by alias or relative. */
const MOCK_PATH = /["'](?:@\/|(?:\.\.?\/)+)lib\/mock\b/;

test("the guard spots mock imports", () => {
  expect('import { getScan } from "@/lib/mock/api";').toMatch(MOCK_PATH);
  expect('vi.mock("@/lib/mock/api", () => ({}));').toMatch(MOCK_PATH);
  expect("import x from '../../lib/mock/fixtures';").toMatch(MOCK_PATH);
  expect('import { getScan } from "@/lib/api";').not.toMatch(MOCK_PATH);
});

// Pages, screens and their tests go through @/lib/api, so swapping the mock for
// the real API changes nothing outside src/lib/api.
test("nothing under src/app or src/components imports the mock", () => {
  const files = globSync("src/{app,components}/**/*.{ts,tsx}");
  expect(files.length).toBeGreaterThan(0);
  for (const file of files) {
    expect(readFileSync(file, "utf8"), file).not.toMatch(MOCK_PATH);
  }
});
