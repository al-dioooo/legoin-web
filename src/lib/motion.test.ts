import { afterEach, expect, test, vi } from "vitest";
import {
  digitsOf,
  MAX_STAGGER,
  magnetOffset,
  parseDuration,
  prefersReducedMotion,
  snapHaptic,
  staggerIndex,
} from "@/lib/motion";

function mockMedia(matching: string[]) {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches: matching.includes(query),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test("stagger steps stop at the cap", () => {
  expect(staggerIndex(0)).toBe(0);
  expect(staggerIndex(3)).toBe(3);
  expect(staggerIndex(40)).toBe(MAX_STAGGER);
  expect(staggerIndex(-2)).toBe(0);
});

test("a count splits into its digits", () => {
  expect(digitsOf(0)).toEqual([0]);
  expect(digitsOf(8)).toEqual([8]);
  expect(digitsOf(108)).toEqual([1, 0, 8]);
  expect(digitsOf(-3)).toEqual([3]);
  expect(digitsOf(2.6)).toEqual([3]);
});

test("CSS times read as milliseconds", () => {
  expect(parseDuration("200ms")).toBe(200);
  expect(parseDuration(" 0.25s ")).toBe(250);
  expect(parseDuration("")).toBe(0);
  expect(parseDuration("fast")).toBe(0);
});

test("reduced motion follows the system setting", () => {
  expect(prefersReducedMotion()).toBe(false);
  mockMedia(["(prefers-reduced-motion: reduce)"]);
  expect(prefersReducedMotion()).toBe(true);
});

test("the snap is felt only on touch screens without reduced motion", () => {
  const vibrate = vi.fn(() => true);
  vi.stubGlobal("navigator", { vibrate });

  mockMedia(["(hover: hover) and (pointer: fine)"]);
  expect(snapHaptic()).toBe(false);

  mockMedia(["(pointer: coarse)", "(prefers-reduced-motion: reduce)"]);
  expect(snapHaptic()).toBe(false);

  mockMedia(["(pointer: coarse)"]);
  expect(snapHaptic()).toBe(true);
  expect(vibrate).toHaveBeenCalledExactlyOnceWith(8);
});

test("a magnetic control leans toward a nearby pointer only", () => {
  const rect = { left: 100, top: 100, width: 120, height: 48 };
  expect(magnetOffset({ x: 160, y: 300 }, rect)).toEqual({ x: 0, y: 0 });
  const near = magnetOffset({ x: 250, y: 124 }, rect);
  expect(near.x).toBeGreaterThan(0);
  expect(near.y).toBe(0);
  const closer = magnetOffset({ x: 225, y: 124 }, rect);
  expect(closer.x).toBeGreaterThan(near.x);
  expect(closer.x).toBeLessThanOrEqual(6);
});
