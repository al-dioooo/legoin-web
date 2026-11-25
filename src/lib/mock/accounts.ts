/* Accounts for the mock backend, kept in this browser's localStorage only,
 * as the API keeps them on its side (contract, "4. Accounts"). A password is
 * never stored as typed: the mock keeps a SHA-256 of it, salted with the
 * email. That's not the API's Argon2id, and it doesn't need to be: the mock's
 * accounts never leave the browser that made them. Browser only.
 */
import {
  isEmail,
  normalizeEmail,
  PASSWORD_MAX,
  PASSWORD_MIN,
  passwordProblem,
} from "@/lib/account-rules";
import type { Account, AuthFailure } from "@/lib/domain";

const ACCOUNTS_KEY = "legoin.mock.accounts.v1";
const SESSIONS_KEY = "legoin.mock.sessions.v1";

/** As long as the API's sessions last. The mock never ends one on its own. */
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;

/** What logging in answers, as the API's `Session`. */
export type MockSession = {
  token: string;
  expiresAt: string;
  account: Account;
};

type StoredAccount = Account & { passwordHash: string };

/** Logging in or making an account failed, as the API's 401, 409 or 429. */
export class MockAuthError extends Error {
  constructor(readonly reason: AuthFailure) {
    super(`Mock log-in failed: ${reason}`);
    this.name = "MockAuthError";
  }
}

/** A field that breaks the rules, where the API answers `400 invalid_request`. */
export class MockInvalidError extends Error {
  constructor(
    readonly field: "email" | "password",
    message: string,
  ) {
    super(message);
    this.name = "MockInvalidError";
  }
}

function read<T>(key: string, empty: T): T {
  const stored = localStorage.getItem(key);
  return stored ? (JSON.parse(stored) as T) : empty;
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

const accounts = () => read<StoredAccount[]>(ACCOUNTS_KEY, []);
/** Token to account id. */
const sessions = () => read<Record<string, string>>(SESSIONS_KEY, {});

function randomText(bytes: number) {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

/**
 * A SHA-256 of the password, salted with the email. A page served over plain
 * HTTP on a LAN, such as a phone testing `pnpm dev`, has no `crypto.subtle`;
 * there it falls back to FNV-1a, which hides the password from a glance at
 * storage but is no protection.
 */
export async function passwordHash(email: string, password: string) {
  const data = new TextEncoder().encode(`legoin-mock\n${email}\n${password}`);
  if (globalThis.crypto?.subtle) {
    const digest = await crypto.subtle.digest("SHA-256", data);
    return `sha256:${Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("")}`;
  }
  let hash = 0x811c9dc5;
  for (const byte of data) {
    hash = Math.imul(hash ^ byte, 0x01000193) >>> 0;
  }
  return `fnv1a:${hash.toString(16).padStart(8, "0")}`;
}

function checkFields(email: string, password: string, forLogIn: boolean) {
  if (!isEmail(email)) {
    throw new MockInvalidError("email", "email must look like name@domain.");
  }
  if (passwordProblem(password, { forLogIn })) {
    throw new MockInvalidError(
      "password",
      `password must be ${PASSWORD_MIN} to ${PASSWORD_MAX} characters.`,
    );
  }
}

function startSession(account: Account): MockSession {
  const token = `mock_${randomText(24)}`;
  write(SESSIONS_KEY, { ...sessions(), [token]: account.id });
  return {
    token,
    expiresAt: new Date(Date.now() + SESSION_MS).toISOString(),
    account,
  };
}

const publicAccount = ({ id, email, createdAt }: StoredAccount): Account => ({
  id,
  email,
  createdAt,
});

/** Makes an account and logs it in. */
export async function register(
  email: string,
  password: string,
): Promise<MockSession> {
  checkFields(email, password, false);
  const normalized = normalizeEmail(email);
  if (accounts().some((account) => account.email === normalized)) {
    throw new MockAuthError("email_taken");
  }
  const account: StoredAccount = {
    id: `acc_${randomText(6)}`,
    email: normalized,
    createdAt: new Date().toISOString(),
    passwordHash: await passwordHash(normalized, password),
  };
  write(ACCOUNTS_KEY, [...accounts(), account]);
  return startSession(publicAccount(account));
}

/** Logs in, as a new session. A wrong email and a wrong password look alike. */
export async function logIn(
  email: string,
  password: string,
): Promise<MockSession> {
  checkFields(email, password, true);
  const normalized = normalizeEmail(email);
  const account = accounts().find(
    (candidate) => candidate.email === normalized,
  );
  const hash = await passwordHash(normalized, password);
  if (!account || account.passwordHash !== hash) {
    throw new MockAuthError("invalid_credentials");
  }
  return startSession(publicAccount(account));
}

/** Ends the session; an unknown token is fine, as with the API. */
export function logOut(token: string | undefined) {
  if (!token) return;
  const { [token]: _ended, ...rest } = sessions();
  write(SESSIONS_KEY, rest);
}

/** The account a token belongs to, or null for none or an ended session. */
export function accountFor(token: string | undefined): Account | null {
  if (!token) return null;
  const id = sessions()[token];
  const account = id && accounts().find((candidate) => candidate.id === id);
  return account ? publicAccount(account) : null;
}
