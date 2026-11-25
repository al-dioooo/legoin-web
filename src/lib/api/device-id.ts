/* The `Legoin-Device-Id` the API keeps each device's scans apart by: a random
 * UUID made once and kept in localStorage. It's a placeholder until the team
 * decides on accounts, not security (the API contract's open question 2).
 * Browser only.
 */

const STORAGE_KEY = "legoin.deviceId.v1";

/** For when storage is blocked: one id for as long as the page lives. */
let unsaved: string | undefined;

/** This device's id, made on the first call and the same after that. */
export function deviceId(): string {
  try {
    const kept = localStorage.getItem(STORAGE_KEY);
    if (kept) return kept;
    const made = newUuid();
    localStorage.setItem(STORAGE_KEY, made);
    return made;
  } catch {
    unsaved ??= newUuid();
    return unsaved;
  }
}

/**
 * A version 4 UUID. `crypto.randomUUID` only exists on HTTPS and localhost,
 * so a phone testing a dev server over the LAN gets one built from
 * `crypto.getRandomValues`, which works everywhere.
 */
export function newUuid(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4),
    hex.slice(4, 6),
    hex.slice(6, 8),
    hex.slice(8, 10),
    hex.slice(10),
  ]
    .map((part) => part.join(""))
    .join("-");
}
