/* The `Legoin-Device-Id` this browser sent before accounts: a random UUID
 * kept in localStorage. The API kept scans by it, and the first log-in or
 * account from this browser moves them to the account (contract, "Scans from
 * before accounts"). Nothing makes a new one. Browser only.
 */

const STORAGE_KEY = "legoin.deviceId.v1";

/** What the API takes as `deviceId`, as the header was. */
const DEVICE_ID = /^[A-Za-z0-9._-]{1,128}$/;

/** This browser's old device id, if it has one the API would take. */
export function legacyDeviceId(): string | undefined {
  try {
    const kept = localStorage.getItem(STORAGE_KEY);
    return kept && DEVICE_ID.test(kept) ? kept : undefined;
  } catch {
    return undefined;
  }
}

/** Once its scans have moved, the id has nothing left to do. */
export function forgetDeviceId() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Blocked storage has no id to forget.
  }
}
