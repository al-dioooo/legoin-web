import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { forgetDeviceId, legacyDeviceId } from "@/lib/api/device-id";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("the old device id is read back, and nothing makes a new one", () => {
  expect(legacyDeviceId()).toBeUndefined();
  expect(localStorage.length).toBe(0);
  localStorage.setItem(
    "legoin.deviceId.v1",
    "3b0e6f1c-5d2a-4f7e-9c41-8a2d7e5b9f10",
  );
  expect(legacyDeviceId()).toBe("3b0e6f1c-5d2a-4f7e-9c41-8a2d7e5b9f10");
});

test("an id the API wouldn't take isn't sent", () => {
  localStorage.setItem("legoin.deviceId.v1", "not a device id");
  expect(legacyDeviceId()).toBeUndefined();
  localStorage.setItem("legoin.deviceId.v1", "x".repeat(129));
  expect(legacyDeviceId()).toBeUndefined();
});

test("once forgotten, it's gone", () => {
  localStorage.setItem("legoin.deviceId.v1", "kept-from-last-visit");
  forgetDeviceId();
  expect(legacyDeviceId()).toBeUndefined();
});

test("with storage blocked, there's no id and nothing fails", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new DOMException("blocked", "SecurityError");
  });
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
    throw new DOMException("blocked", "SecurityError");
  });
  expect(legacyDeviceId()).toBeUndefined();
  expect(() => forgetDeviceId()).not.toThrow();
});
