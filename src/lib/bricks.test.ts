// @vitest-environment node
import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import {
  BRICK_COLORS,
  describePart,
  formatConfidence,
  shortPartLabel,
} from "@/lib/bricks";

test("every brick color has a token in tokens.css", () => {
  const tokens = readFileSync(
    new URL("../app/tokens.css", import.meta.url),
    "utf8",
  );
  for (const id of Object.keys(BRICK_COLORS)) {
    expect(tokens).toMatch(new RegExp(`--brick-${id}: #[0-9a-f]{6};`));
  }
});

test("describePart reads as quantity, part and color", () => {
  expect(
    describePart({ part: "brick-2x4", color: "light-gray", quantity: 3 }),
  ).toBe("3× Brick 2×4 abu-abu terang");
});

test("short labels keep bricks bare and name other kinds", () => {
  expect(shortPartLabel("brick-2x4")).toBe("2×4");
  expect(shortPartLabel("plate-1x2")).toBe("plate 1×2");
  expect(shortPartLabel("slope-2x2")).toBe("slope 2×2");
});

test("confidence uses an Indonesian decimal comma", () => {
  expect(formatConfidence(0.9)).toBe("0,90");
});
