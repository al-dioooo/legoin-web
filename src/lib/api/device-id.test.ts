import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { deviceId, newUuid } from "@/lib/api/device-id";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test("the device id is made once, kept in localStorage and reused", () => {
  const id = deviceId();
  expect(id).toMatch(UUID_V4);
  expect(deviceId()).toBe(id);
  expect(Object.values({ ...localStorage })).toEqual([id]);
});

test("a kept id survives a reload", () => {
  localStorage.setItem("legoin.deviceId.v1", "kept-from-last-visit");
  expect(deviceId()).toBe("kept-from-last-visit");
});

test("without crypto.randomUUID, as on plain HTTP, it's still a version 4 UUID", () => {
  const random = crypto;
  vi.stubGlobal("crypto", {
    getRandomValues: (bytes: Uint8Array) => bytes.fill(0xff),
  });
  expect(newUuid()).toBe("ffffffff-ffff-4fff-bfff-ffffffffffff");
  vi.stubGlobal("crypto", {
    getRandomValues: (bytes: Uint8Array) => random.getRandomValues(bytes),
  });
  const ids = new Set(Array.from({ length: 50 }, newUuid));
  expect(ids.size).toBe(50);
  for (const id of ids) expect(id).toMatch(UUID_V4);
});

test("with storage blocked, the id holds for the page's life", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new DOMException("blocked", "SecurityError");
  });
  const id = deviceId();
  expect(id).toMatch(UUID_V4);
  expect(deviceId()).toBe(id);
});
