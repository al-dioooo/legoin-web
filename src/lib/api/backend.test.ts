import { expect, test } from "vitest";
import { backendFor, inOrder } from "@/lib/api/backend";
import { mockBackend } from "@/lib/api/mock-backend";
import type { ScanStage } from "@/lib/domain";

test("without an API URL the mock serves the data", () => {
  expect(backendFor(undefined)).toBe(mockBackend);
  // `cp .env.example .env.local` leaves it empty.
  expect(backendFor("")).toBe(mockBackend);
  expect(backendFor("  ")).toBe(mockBackend);
});

test("an API URL fails loudly until there's an HTTP client", () => {
  expect(() => backendFor("https://api.legoin.test")).toThrow(
    /NEXT_PUBLIC_API_URL.*no HTTP client/,
  );
});

test("stages reach the screen once each, in order", () => {
  const heard: ScanStage[] = [];
  const report = inOrder((stage) => heard.push(stage));
  // What a backend that polls might see: repeats, a missed stage, a step back.
  for (const stage of [
    "detecting",
    "detecting",
    "coloring",
    "classifying",
    "coloring",
  ] as const) {
    report(stage);
  }
  expect(heard).toEqual(["detecting", "coloring"]);
});
