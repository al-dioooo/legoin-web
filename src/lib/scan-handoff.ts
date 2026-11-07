/* The capture flow hands the scan it just received to the results screen, so
 * the results render in the same frame as the navigation. That lets the photo
 * morph across instead of the screen waiting on a loading state. The results
 * still read the scan from the API right after, and then forget the handoff.
 */
import type { Scan } from "@/lib/domain";

let handedOff: Scan | null = null;

export function handOffScan(scan: Scan) {
  handedOff = scan;
}

/** The scan handed off for this id, or null. */
export function handedOffScan(id: string) {
  return handedOff?.id === id ? handedOff : null;
}

/** Drops the handoff once the API's copy is in, so it never goes stale. */
export function forgetHandedOffScan(id: string) {
  if (handedOff?.id === id) handedOff = null;
}
