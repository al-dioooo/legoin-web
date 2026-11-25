/* What serves the data layer, and the one place that picks it: the mock, or
 * the HTTP client for the API contract, api/contract.md in
 * al-dioooo/legoin-docs
 * (https://github.com/al-dioooo/legoin-docs/blob/main/api/contract.md).
 */
import type { Locale } from "@/i18n/locales";
import { httpBackend } from "@/lib/api/http-backend";
import { mockBackend } from "@/lib/api/mock-backend";
import type { Session } from "@/lib/api/session";
import {
  type Account,
  type DetectionChange,
  type Idea,
  type Photo,
  PICTURE_STAGES,
  type PictureBuild,
  type PictureQuota,
  type PictureStage,
  SCAN_STAGES,
  type Scan,
  type ScanStage,
  type StoredIdea,
  type Theme,
} from "@/lib/domain";

export type CreateScanOptions = {
  /** Hears the pipeline's progress. See `createScan` in `@/lib/api`. */
  onStage?: (stage: ScanStage) => void;
  signal?: AbortSignal;
};

export type GetIdeasOptions = {
  /** Idea ids already shown, oldest first. */
  exclude?: readonly string[];
};

export type CreatePictureBuildOptions = {
  /** Hears the job's progress. See `createPictureBuild` in `@/lib/api`. */
  onStage?: (stage: PictureStage) => void;
  signal?: AbortSignal;
};

export type GetPictureBuildOptions = {
  /** A scan to check the build's parts against, for `check`. */
  scanId?: string;
};

/** What logging in or making an account sends (contract, "4. Accounts"). */
export type Credentials = {
  email: string;
  password: string;
  /** This browser's old device id, so its scans move to the account. */
  deviceId?: string;
};

/** Everything a backend provides: the mock, or the HTTP client. */
export type Backend = {
  register(credentials: Credentials): Promise<Session>;
  logIn(credentials: Credentials): Promise<Session>;
  /** Ends the kept session, if any. */
  logOut(): Promise<void>;
  /** The kept session's account; rejects with an UnauthorizedError without one. */
  getAccount(): Promise<Account>;
  createScan(photo: Photo, options: CreateScanOptions): Promise<Scan>;
  getScan(id: string): Promise<Scan | null>;
  listScans(): Promise<Scan[]>;
  updateDetections(id: string, changes: DetectionChange[]): Promise<Scan>;
  deleteScan(id: string): Promise<void>;
  getIdeas(
    scanId: string,
    theme: Theme,
    locale: Locale,
    options: GetIdeasOptions,
  ): Promise<Idea[]>;
  getIdea(scanId: string, ideaId: string): Promise<StoredIdea | null>;
  getPictureQuota(): Promise<PictureQuota>;
  createPictureBuild(
    picture: Photo,
    locale: Locale,
    options: CreatePictureBuildOptions,
  ): Promise<PictureBuild>;
  listPictureBuilds(): Promise<PictureBuild[]>;
  getPictureBuild(
    id: string,
    options: GetPictureBuildOptions,
  ): Promise<PictureBuild | null>;
  deletePictureBuild(id: string): Promise<void>;
};

/**
 * The backend for `NEXT_PUBLIC_API_URL`: the mock when it's unset or empty,
 * otherwise the HTTP client for the API at that base URL. A value that isn't
 * an http(s) URL throws instead of quietly using the mock.
 */
export function backendFor(apiUrl: string | undefined): Backend {
  const base = apiUrl?.trim();
  if (!base) return mockBackend;
  if (!/^https?:\/\/[^/]/.test(base)) {
    throw new Error(
      `NEXT_PUBLIC_API_URL is set to "${apiUrl}", which isn't an http(s) URL. Set it to the API's base URL, version included (https://api.legoin.example/v1), or leave it empty to use the mock backend.`,
    );
  }
  return httpBackend(base);
}

/**
 * Passes each stage on once, in pipeline order, so a backend that polls can
 * report the current stage on every poll. Repeats and steps back are dropped;
 * a stage the backend never reported is skipped.
 */
export function inOrder(onStage: (stage: ScanStage) => void) {
  return inOrderOf(SCAN_STAGES, onStage);
}

/** `inOrder` for a picture build's stages. */
export function picturesInOrder(onStage: (stage: PictureStage) => void) {
  return inOrderOf(PICTURE_STAGES, onStage);
}

function inOrderOf<Stage>(
  stages: readonly Stage[],
  onStage: (stage: Stage) => void,
) {
  let reached = -1;
  return (stage: Stage) => {
    const index = stages.indexOf(stage);
    if (index <= reached) return;
    reached = index;
    onStage(stage);
  };
}
