import type { AuthFailure, ScanFailure } from "@/lib/domain";

/** A failed call, with the reason the screens turn into a message. */
export class ApiError extends Error {
  constructor(readonly reason: ScanFailure) {
    super(`API call failed: ${reason}`);
    this.name = "ApiError";
  }
}

/**
 * No scan, scan job or idea with this id: the API's `404 not_found`, or a scan
 * the mock no longer has. `getScan` and `getIdea` answer null instead; the
 * other calls reject with this, and screens treat it like any other failure.
 */
export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * No valid session: the API's `401 unauthorized`, or the mock with no one
 * logged in. The data layer forgets the session first, so pages that need one
 * send the person to log in.
 */
export class UnauthorizedError extends Error {
  constructor(message = "Not logged in") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Logging in or making an account failed, for a reason the form shows. */
export class AuthError extends Error {
  constructor(readonly reason: AuthFailure) {
    super(`Log-in failed: ${reason}`);
    this.name = "AuthError";
  }
}
