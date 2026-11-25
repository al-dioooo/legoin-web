/* The capture flow hands the scan it just received to the results screen, so
 * the results render in the same frame as the navigation. That lets the photo
 * morph across instead of the screen waiting on a loading state. The results
 * still read the scan from the API right after, and then forget the handoff.
 *
 * The API serves the photo from a URL of its own, which hasn't loaded yet when
 * the scan arrives. So the handoff also carries the local copy the scanner was
 * showing, for the results to draw until the API's copy has loaded.
 */
import type { Photo, Scan } from "@/lib/domain";

let handedOff: { scan: Scan; localPhoto: Photo } | null = null;

/** `localPhoto` is the copy already on screen; by default the scan's own. */
export function handOffScan(scan: Scan, localPhoto: Photo = scan.photo) {
  handedOff = { scan, localPhoto };
}

/** The scan handed off for this id, or null. */
export function handedOffScan(id: string) {
  return handedOff?.scan.id === id ? handedOff.scan : null;
}

/** The local copy of the handed-off scan's photo, or null. */
export function handedOffPhoto(id: string) {
  return handedOff?.scan.id === id ? handedOff.localPhoto : null;
}

/** Drops the handoff once the API's copy is in, so it never goes stale. */
export function forgetHandedOffScan(id: string) {
  if (handedOff?.scan.id === id) handedOff = null;
}
