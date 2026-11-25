/* The data layer. Screens read and write only through these functions, so
 * swapping the mock for the real API changes nothing outside src/lib/api.
 * `NEXT_PUBLIC_API_URL` picks the backend (see backend.ts): unset, it's the
 * mock in localStorage; set, it's the HTTP client, which the browser runs too.
 * Either way, call these from Client Components. Every call but the account
 * ones needs a session (contract, "4. Accounts"); without one it rejects with
 * an UnauthorizedError.
 */
import type { Locale } from "@/i18n/locales";
import {
  backendFor,
  type CreatePictureBuildOptions,
  type CreateScanOptions,
  type GetIdeasOptions,
  type GetPictureBuildOptions,
  inOrder,
  picturesInOrder,
} from "@/lib/api/backend";
import { forgetDeviceId, legacyDeviceId } from "@/lib/api/device-id";
import { UnauthorizedError } from "@/lib/api/error";
import {
  currentSession,
  forgetSession,
  type Session,
  saveSession,
  subscribeToSession,
} from "@/lib/api/session";
import type {
  Account,
  DetectionChange,
  Idea,
  Photo,
  PictureBuild,
  PictureQuota,
  Scan,
  StoredIdea,
  Theme,
} from "@/lib/domain";

export type {
  CreatePictureBuildOptions,
  CreateScanOptions,
  GetIdeasOptions,
  GetPictureBuildOptions,
} from "@/lib/api/backend";
export {
  ApiError,
  AuthError,
  NotFoundError,
  PictureError,
  UnauthorizedError,
} from "@/lib/api/error";

// Written out in full so Next.js inlines it into the browser bundle.
const backend = backendFor(process.env.NEXT_PUBLIC_API_URL);

/** Keeps the session, and lets this browser's old device id go: its scans have moved. */
async function keep(answer: Promise<Session>): Promise<Account> {
  const session = await answer;
  saveSession(session);
  forgetDeviceId();
  return session.account;
}

/**
 * Makes an account and logs it in. Scans this browser made before accounts
 * move to it. Rejects with an AuthError `email_taken` when the email has one.
 */
export function register(email: string, password: string): Promise<Account> {
  return keep(
    backend.register({ email, password, deviceId: legacyDeviceId() }),
  );
}

/**
 * Logs in. Rejects with an AuthError: `invalid_credentials` for a wrong email
 * or password, `rate_limited` after too many tries.
 */
export function logIn(email: string, password: string): Promise<Account> {
  return keep(backend.logIn({ email, password, deviceId: legacyDeviceId() }));
}

/** Logs out here, even when the backend can't be reached. */
export async function logOut(): Promise<void> {
  try {
    if (currentSession()) await backend.logOut();
  } catch {
    // The session is forgotten below either way.
  } finally {
    forgetSession();
  }
}

/** The logged-in account as the backend has it, or null when there's none. */
export async function getAccount(): Promise<Account | null> {
  if (!currentSession()) return null;
  try {
    return await backend.getAccount();
  } catch (error) {
    if (!(error instanceof UnauthorizedError)) throw error;
    forgetSession();
    return null;
  }
}

/**
 * The account kept from logging in, without asking the backend: the same
 * object until it changes. For `useSyncExternalStore`, with
 * `subscribeToAccount`.
 */
export function currentAccount(): Account | null {
  return currentSession()?.account ?? null;
}

/** Hears logging in and out, here and in other tabs. Returns the unsubscribe. */
export function subscribeToAccount(listener: () => void): () => void {
  return subscribeToSession(listener);
}

/**
 * Every call that needs a session: without a valid one, the session is
 * forgotten, so pages that need one send the person to log in.
 */
async function signedIn<T>(call: Promise<T>): Promise<T> {
  try {
    return await call;
  } catch (error) {
    if (error instanceof UnauthorizedError) forgetSession();
    throw error;
  }
}

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
  return signedIn(
    backend.createScan(photo, {
      signal,
      onStage: onStage && inOrder(onStage),
    }),
  );
}

/** The scan, or null if there's none with this id. */
export function getScan(id: string): Promise<Scan | null> {
  return signedIn(backend.getScan(id));
}

/** Newest first. */
export function listScans(): Promise<Scan[]> {
  return signedIn(backend.listScans());
}

/**
 * Applies corrections and returns the updated scan. A correction that changes
 * the inventory drops the scan's `ideas`, since they were checked against the
 * pieces as they were; `lastTheme` stays. One that leaves the inventory as it
 * was, like confirming a flagged piece, keeps them. A scan that's gone rejects
 * with a NotFoundError.
 */
export function updateDetections(
  id: string,
  changes: DetectionChange[],
): Promise<Scan> {
  return signedIn(backend.updateDetections(id, changes));
}

export function deleteScan(id: string): Promise<void> {
  return signedIn(backend.deleteScan(id));
}

/**
 * Asks for three new ideas for a scan, in the requested language, each checked
 * against the scan's inventory. They're kept as the scan's `ideas`, replacing
 * the ones before, and the theme becomes its `lastTheme`. For "Try other
 * ideas", `exclude` lists the ids already shown, oldest first. A failed request
 * rejects with an ApiError, `no_pieces` for a scan with no pieces, and a scan
 * that's gone with a NotFoundError.
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
  return signedIn(backend.getIdeas(scanId, theme, locale, { exclude }));
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
  return signedIn(backend.getIdea(scanId, ideaId));
}

/**
 * Whether this account can start a picture build now, and how many it has
 * left today (contract, "13. Picture builds"). Read it before the upload.
 */
export function getPictureQuota(): Promise<PictureQuota> {
  return signedIn(backend.getPictureQuota());
}

/**
 * Sends the picture to be designed as a LEGO build, in `locale`, and resolves
 * with the saved build. It takes about a minute: `onStage` hears each stage
 * once, in order. A build that fails or can't start rejects with a
 * PictureError; aborting through `signal` rejects with an AbortError and
 * cancels the job. The picture goes to the model provider (ADR-0012), so say
 * so before calling this.
 */
export function createPictureBuild(
  picture: Photo,
  locale: Locale,
  { onStage, signal }: CreatePictureBuildOptions = {},
): Promise<PictureBuild> {
  return signedIn(
    backend.createPictureBuild(picture, locale, {
      signal,
      onStage: onStage && picturesInOrder(onStage),
    }),
  );
}

/** This account's picture builds, newest first. */
export function listPictureBuilds(): Promise<PictureBuild[]> {
  return signedIn(backend.listPictureBuilds());
}

/**
 * One picture build, or null if there's none with this id. With `scanId`, its
 * `check` says which of its parts that scan has and which are missing, as the
 * scan is now; a scan that's gone leaves `check` out.
 */
export function getPictureBuild(
  id: string,
  { scanId }: GetPictureBuildOptions = {},
): Promise<PictureBuild | null> {
  return signedIn(backend.getPictureBuild(id, { scanId }));
}

/** Deletes the build, with its picture and model. */
export function deletePictureBuild(id: string): Promise<void> {
  return signedIn(backend.deletePictureBuild(id));
}
