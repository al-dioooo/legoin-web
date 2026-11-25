import type { ScanFailure } from "@/lib/domain";

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
