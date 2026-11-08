/* The data layer. Screens read and write only through these functions, so
 * swapping the mock for the real API changes nothing outside src/lib/api.
 * `NEXT_PUBLIC_API_URL` picks the backend (see backend.ts); unset, it's the
 * browser-side mock, so call these from Client Components.
 */
import type { Locale } from "@/i18n/locales";
import {
  backendFor,
  type CreateScanOptions,
  type GetIdeasOptions,
  inOrder,
} from "@/lib/api/backend";
import type {
  DetectionChange,
  Idea,
  Photo,
  Scan,
  StoredIdea,
  Theme,
} from "@/lib/domain";

export type { CreateScanOptions, GetIdeasOptions } from "@/lib/api/backend";
export { ApiError } from "@/lib/api/error";

// Written out in full so Next.js inlines it into the browser bundle.
const backend = backendFor(process.env.NEXT_PUBLIC_API_URL);

/**
 * Scans a photo and saves the result. `onStage` hears each pipeline stage
 * once, in order; a backend that only polls now and then may skip one.
 * A failed scan rejects with an ApiError. Aborting through `signal` rejects
 * with an AbortError.
 */
export function createScan(
  photo: Photo,
  { onStage, signal }: CreateScanOptions = {},
): Promise<Scan> {
  return backend.createScan(photo, {
    signal,
    onStage: onStage && inOrder(onStage),
  });
}

/** The scan, or null if there's none with this id. */
export function getScan(id: string): Promise<Scan | null> {
  return backend.getScan(id);
}

/** Newest first. */
export function listScans(): Promise<Scan[]> {
  return backend.listScans();
}

/**
 * Applies corrections and returns the updated scan. A correction that changes
 * the inventory drops the scan's `ideas`, since they were checked against the
 * pieces as they were; `lastTheme` stays. One that leaves the inventory as it
 * was, like confirming a flagged piece, keeps them.
 */
export function updateDetections(
  id: string,
  changes: DetectionChange[],
): Promise<Scan> {
  return backend.updateDetections(id, changes);
}

export function deleteScan(id: string): Promise<void> {
  return backend.deleteScan(id);
}

/**
 * Asks for three new ideas for a scan, in the requested language, each checked
 * against the scan's inventory. They're kept as the scan's `ideas`, replacing
 * the ones before, and the theme becomes its `lastTheme`. For "Try other
 * ideas", `exclude` lists the ids already shown, oldest first. A failed request
 * rejects with an ApiError.
 *
 * Every call asks again; with a real model that's a wait and different ideas.
 * To show the kept ones, read `ideas` from `getScan` instead.
 */
export function getIdeas(
  scanId: string,
  theme: Theme,
  locale: Locale,
  { exclude }: GetIdeasOptions = {},
): Promise<Idea[]> {
  return backend.getIdeas(scanId, theme, locale, { exclude });
}

/**
 * One idea from the scan's latest set, with that set (its theme, its language
 * and the ideas around it). Ideas come back in the language they were written
 * in, never translated; compare `set.locale` with the page's. Null when the
 * scan is gone or its latest set has no such idea.
 */
export function getIdea(
  scanId: string,
  ideaId: string,
): Promise<StoredIdea | null> {
  return backend.getIdea(scanId, ideaId);
}
