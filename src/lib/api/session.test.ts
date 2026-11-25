import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  currentSession,
  forgetSession,
  isSession,
  type Session,
  saveSession,
  sessionToken,
  subscribeToSession,
} from "@/lib/api/session";

const SESSION: Session = {
  token: "lgn_pY5h2PcG9NnqPsZk4j-mzx5D7dFTpfR8_jUFioj9cOg",
  expiresAt: "2026-12-25T03:10:00.000Z",
  account: {
    id: "acc_7r2k9d",
    email: "ana@example.com",
    createdAt: "2026-11-25T03:10:00.000Z",
  },
};
const BEFORE_EXPIRY = Date.parse("2026-12-01T00:00:00.000Z");

beforeEach(() => {
  localStorage.clear();
  forgetSession();
  vi.useFakeTimers({ now: BEFORE_EXPIRY, toFake: ["Date"] });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

test("a saved session is kept in localStorage, and read back as the same object", () => {
  expect(currentSession()).toBeNull();
  saveSession(SESSION);
  expect(JSON.parse(localStorage.getItem("legoin.session.v1") ?? "")).toEqual(
    SESSION,
  );
  const first = currentSession();
  expect(first).toEqual(SESSION);
  expect(currentSession()).toBe(first);
  expect(sessionToken()).toBe(SESSION.token);
});

test("an expired session counts as none", () => {
  saveSession(SESSION);
  expect(currentSession(Date.parse(SESSION.expiresAt))).toBeNull();
  vi.setSystemTime(Date.parse(SESSION.expiresAt) + 1);
  expect(sessionToken()).toBeUndefined();
});

test("something else under the key counts as none", () => {
  localStorage.setItem("legoin.session.v1", "not json");
  expect(currentSession()).toBeNull();
  localStorage.setItem(
    "legoin.session.v1",
    JSON.stringify({ ...SESSION, account: { id: "acc_1" } }),
  );
  expect(currentSession()).toBeNull();
});

test("isSession checks every field an answer must have", () => {
  expect(isSession(SESSION)).toBe(true);
  expect(isSession({ ...SESSION, token: "" })).toBe(false);
  expect(isSession({ ...SESSION, expiresAt: "soon" })).toBe(false);
  expect(
    isSession({ token: SESSION.token, expiresAt: SESSION.expiresAt }),
  ).toBe(false);
  expect(isSession(null)).toBe(false);
});

test("listeners hear saving and forgetting, here and from another tab", () => {
  const listener = vi.fn();
  const stop = subscribeToSession(listener);
  saveSession(SESSION);
  forgetSession();
  // Nothing to forget, so nothing changes.
  forgetSession();
  expect(listener).toHaveBeenCalledTimes(2);
  window.dispatchEvent(
    new StorageEvent("storage", { key: "legoin.session.v1" }),
  );
  window.dispatchEvent(new StorageEvent("storage", { key: "other" }));
  expect(listener).toHaveBeenCalledTimes(3);
  stop();
  saveSession(SESSION);
  expect(listener).toHaveBeenCalledTimes(3);
});

test("with storage blocked, the session holds for the page's life", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new DOMException("blocked", "SecurityError");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("blocked", "SecurityError");
  });
  saveSession(SESSION);
  expect(currentSession()).toEqual(SESSION);
  forgetSession();
  expect(currentSession()).toBeNull();
});
