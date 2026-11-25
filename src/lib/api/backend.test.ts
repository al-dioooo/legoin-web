import { expect, test, vi } from "vitest";
import { backendFor, inOrder } from "@/lib/api/backend";
import { mockBackend } from "@/lib/api/mock-backend";
import type { ScanStage } from "@/lib/domain";

test("without an API URL the mock serves the data", () => {
  expect(backendFor(undefined)).toBe(mockBackend);
  // `cp .env.example .env.local` leaves it empty.
  expect(backendFor("")).toBe(mockBackend);
  expect(backendFor("  ")).toBe(mockBackend);
});

test("an API URL picks the HTTP client for that base", async () => {
  const fetch = vi.fn(
    async () =>
      new Response(JSON.stringify({ error: { code: "not_found" } }), {
        status: 404,
      }),
  );
  vi.stubGlobal("fetch", fetch);
  try {
    const backend = backendFor(" https://api.legoin.test/v1 ");
    expect(backend).not.toBe(mockBackend);
    expect(await backend.getScan("scn_1")).toBeNull();
    expect(fetch).toHaveBeenCalledWith(
      "https://api.legoin.test/v1/scans/scn_1",
      expect.objectContaining({
        headers: { "Legoin-Device-Id": expect.any(String) },
      }),
    );
  } finally {
    vi.unstubAllGlobals();
  }
});

test("a value that isn't an http(s) URL fails loudly, naming the variable", () => {
  for (const value of ["api.legoin.test", "/v1", "ftp://api.legoin.test"]) {
    expect(() => backendFor(value)).toThrow(/NEXT_PUBLIC_API_URL.*http\(s\)/);
  }
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
