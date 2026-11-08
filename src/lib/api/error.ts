import type { ScanFailure } from "@/lib/domain";

/** A failed call, with the reason the screens turn into a message. */
export class ApiError extends Error {
  constructor(readonly reason: ScanFailure) {
    super(`API call failed: ${reason}`);
    this.name = "ApiError";
  }
}
