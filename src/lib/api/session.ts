/* The session the data layer keeps between visits (contract, "4. Accounts"):
 * the token from logging in, when it expires, and whose it is. It lives in
 * localStorage, so a reload or a new tab stays logged in, and in memory when
 * storage is blocked. Browser only.
 */
import type { Account } from "@/lib/domain";

const STORAGE_KEY = "legoin.session.v1";

/** What logging in answers. Only on the wire and here. */
export type Session = {
  /** Opaque: sent back as `Authorization: Bearer <token>`. */
  token: string;
  /** ISO 8601. After it, the session is gone. */
  expiresAt: string;
  account: Account;
};

const text = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

/** For answers and storage, which may hold anything. */
export function isSession(value: unknown): value is Session {
  const session = value as Partial<Session> | null | undefined;
  const account = session?.account as Partial<Account> | null | undefined;
  return (
    text(session?.token) &&
    text(session?.expiresAt) &&
    !Number.isNaN(Date.parse(session.expiresAt)) &&
    text(account?.id) &&
    text(account?.email) &&
    text(account?.createdAt)
  );
}

/** The session when storage is blocked, for as long as the page lives. */
let unsaved: string | null = null;

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return unsaved;
  }
}

function writeRaw(raw: string | null) {
  unsaved = raw;
  try {
    if (raw === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // Blocked: `unsaved` holds it.
  }
}

let lastRaw: string | null | undefined;
let lastSession: Session | null = null;

/**
 * The kept session, or null when there's none or it has expired. It's the
 * same object until the session changes, as `useSyncExternalStore` needs.
 */
export function currentSession(now = Date.now()): Session | null {
  const raw = readRaw();
  if (raw !== lastRaw) {
    lastRaw = raw;
    try {
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      lastSession = isSession(parsed) ? parsed : null;
    } catch {
      lastSession = null;
    }
  }
  if (lastSession && Date.parse(lastSession.expiresAt) <= now) return null;
  return lastSession;
}

/** The token to send, if someone's logged in. */
export function sessionToken(): string | undefined {
  return currentSession()?.token;
}

const listeners = new Set<() => void>();

function changed() {
  for (const listener of [...listeners]) listener();
}

export function saveSession(session: Session) {
  writeRaw(JSON.stringify(session));
  changed();
}

/** Logs out on this device only: the next call needs a new log-in. */
export function forgetSession() {
  if (readRaw() === null) return;
  writeRaw(null);
  changed();
}

/**
 * Calls `listener` when the session changes: here, or in another tab, which
 * the `storage` event reports. Returns the unsubscribe.
 */
export function subscribeToSession(listener: () => void): () => void {
  listeners.add(listener);
  const fromAnotherTab = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener("storage", fromAnotherTab);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", fromAnotherTab);
  };
}
