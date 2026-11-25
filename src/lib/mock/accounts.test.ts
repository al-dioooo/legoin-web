import { beforeEach, expect, test, vi } from "vitest";
import {
  accountFor,
  logIn,
  logOut,
  MockAuthError,
  MockInvalidError,
  passwordHash,
  register,
} from "@/lib/mock/accounts";

beforeEach(() => {
  localStorage.clear();
});

test("registering makes an account, logs it in and never stores the password", async () => {
  const session = await register(" Ana@Example.com", "baseplate-2x4");
  expect(session.account).toEqual({
    id: expect.stringMatching(/^acc_[0-9a-f]+$/),
    email: "ana@example.com",
    createdAt: expect.any(String),
  });
  expect(Date.parse(session.expiresAt)).toBeGreaterThan(Date.now());
  expect(accountFor(session.token)).toEqual(session.account);
  const stored = JSON.stringify({ ...localStorage });
  expect(stored).not.toContain("baseplate-2x4");
  expect(stored).toContain(
    await passwordHash("ana@example.com", "baseplate-2x4"),
  );
});

test("an email has one account, whatever its case", async () => {
  await register("ana@example.com", "baseplate-2x4");
  await expect(register("ANA@example.com", "another-one")).rejects.toEqual(
    new MockAuthError("email_taken"),
  );
});

test("logging in needs the right email and password, and doesn't say which was wrong", async () => {
  const made = await register("ana@example.com", "baseplate-2x4");
  const session = await logIn("Ana@example.com ", "baseplate-2x4");
  expect(session.account).toEqual(made.account);
  expect(session.token).not.toBe(made.token);
  await expect(logIn("ana@example.com", "wrong-password")).rejects.toEqual(
    new MockAuthError("invalid_credentials"),
  );
  await expect(logIn("bo@example.com", "baseplate-2x4")).rejects.toEqual(
    new MockAuthError("invalid_credentials"),
  );
});

test("fields that break the rules are refused, as the API's invalid_request", async () => {
  await expect(register("ana", "baseplate-2x4")).rejects.toBeInstanceOf(
    MockInvalidError,
  );
  await expect(register("ana@example.com", "short")).rejects.toMatchObject({
    field: "password",
  });
  await expect(logIn("ana@example.com", "")).rejects.toMatchObject({
    field: "password",
  });
});

test("logging out ends only that session", async () => {
  const first = await register("ana@example.com", "baseplate-2x4");
  const second = await logIn("ana@example.com", "baseplate-2x4");
  logOut(first.token);
  logOut("unknown");
  logOut(undefined);
  expect(accountFor(first.token)).toBeNull();
  expect(accountFor(second.token)).toEqual(second.account);
  expect(accountFor(undefined)).toBeNull();
});

test("without crypto.subtle, as on plain HTTP, passwords are still never stored as typed", async () => {
  const subtle = crypto.subtle;
  vi.stubGlobal("crypto", {
    getRandomValues: (bytes: Uint8Array) => crypto.getRandomValues(bytes),
  });
  try {
    expect(await passwordHash("ana@example.com", "baseplate-2x4")).toMatch(
      /^fnv1a:[0-9a-f]{8}$/,
    );
  } finally {
    vi.unstubAllGlobals();
  }
  expect(crypto.subtle).toBe(subtle);
});
