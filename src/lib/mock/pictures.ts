/* The mock's picture builds (contract, "13. Picture builds"), until the
 * Python API runs them. Like the API, an account may start two a day and each
 * job goes through `queued`, `designing`, `checking` and `rendering`. Instead
 * of designing a build, the mock picks one of the library's checked builds
 * (ADR-0010) for the picture, with its picture, model, text and parts.
 * Builds are kept in localStorage, one list per account.
 * Browser only: call it from Client Components.
 */
import type { Locale } from "@/i18n/locales";
import {
  type Photo,
  PICTURE_FAILURES,
  PICTURE_STAGES,
  type PictureBuild,
  type PictureFailure,
  type PictureQuota,
  type PictureStage,
} from "@/lib/domain";
import { checkInventory, toInventory } from "@/lib/inventory";
import { getScan } from "@/lib/mock/api";
import { BUILD_PREVIEWS } from "@/lib/mock/builds";
import { IDEA_TEMPLATES } from "@/lib/mock/fixtures";

const STORAGE_KEY = "legoin.mock.pictures.v1";

/** Picture builds an account may start a day, as the API's default. */
export const DAILY_LIMIT = 2;

/** The library builds a picture may become, picked by the picture. */
const BUILDS = [
  "race-car",
  "little-house",
  "rubber-duck",
  "little-boat",
  "turtle",
];

/** The mock's failures, as the codes the API answers. */
export class MockPictureError extends Error {
  constructor(readonly reason: PictureFailure) {
    super(`Mock picture build failed: ${reason}`);
    this.name = "MockPictureError";
  }
}

export type MockPictureOptions = {
  /** Wait per call, or per stage for a build. Defaults to a demo's pace. */
  delayMs?: number;
  /** Make the build fail with this reason. */
  fail?: PictureFailure;
  /** Whose builds: each account has its own. */
  account?: string;
};

/**
 * `?mock=fail-<reason>` and `?mockDelay=` from a URL query, for demos, with
 * the picture builds' reasons. Unknown values are ignored.
 */
export function pictureOptionsFromSearch(search: string): MockPictureOptions {
  const params = new URLSearchParams(search);
  const options: MockPictureOptions = {};
  const fail = params.get("mock")?.replace(/^fail-/, "");
  if (fail && (PICTURE_FAILURES as readonly string[]).includes(fail)) {
    options.fail = fail as PictureFailure;
  }
  const delay = Number(params.get("mockDelay"));
  if (params.has("mockDelay") && Number.isFinite(delay) && delay >= 0) {
    options.delayMs = delay;
  }
  return options;
}

/** Builds, and when each job started, as `<ISO time>|<random>` so two never clash. */
type Stored = { builds: PictureBuild[]; started: string[] };

const storageKey = (account?: string) =>
  account ? `${STORAGE_KEY}.${account}` : STORAGE_KEY;

function load(account?: string): Stored {
  const stored = localStorage.getItem(storageKey(account));
  return stored ? (JSON.parse(stored) as Stored) : { builds: [], started: [] };
}

function save(stored: Stored, account?: string) {
  localStorage.setItem(storageKey(account), JSON.stringify(stored));
}

const wait = (ms: number) =>
  ms > 0
    ? new Promise((resolve) => setTimeout(resolve, ms))
    : Promise.resolve();

const newId = () =>
  `pic_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const day = (time: string) => time.slice(0, 10);

function nextMidnight(now = new Date()) {
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return midnight.toISOString();
}

function usedToday(stored: Stored) {
  const today = day(new Date().toISOString());
  return stored.started.filter((time) => day(time) === today).length;
}

export async function getPictureQuota({
  delayMs = 150,
  account,
}: MockPictureOptions = {}): Promise<PictureQuota> {
  await wait(delayMs);
  const used = usedToday(load(account));
  return {
    available: used < DAILY_LIMIT,
    ...(used >= DAILY_LIMIT ? { reason: "limit" as const } : {}),
    used,
    limit: DAILY_LIMIT,
    resetsAt: nextMidnight(),
  };
}

/** A library build for this picture, the same one every time. */
function buildFor(picture: Photo) {
  let hash = 0;
  for (const char of picture.src.slice(-200)) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  const id = BUILDS[hash % BUILDS.length];
  const template = IDEA_TEMPLATES.find((candidate) => candidate.id === id);
  if (!template) throw new Error(`No template ${id}`);
  return { template, preview: BUILD_PREVIEWS[id] };
}

/**
 * Designs a build of the picture, reporting each stage, and saves it.
 * Aborting through `signal` rejects with an AbortError and saves nothing.
 */
export async function createPictureBuild(
  picture: Photo,
  locale: Locale,
  {
    delayMs = 900,
    fail,
    account,
    onStage,
    signal,
  }: MockPictureOptions & {
    onStage?: (stage: PictureStage) => void;
    signal?: AbortSignal;
  } = {},
): Promise<PictureBuild> {
  const stored = load(account);
  if (usedToday(stored) >= DAILY_LIMIT) {
    throw new MockPictureError("picture_limit");
  }
  const startedAt = `${new Date().toISOString()}|${Math.random().toString(36).slice(2)}`;
  save({ ...stored, started: [...stored.started, startedAt] }, account);
  const giveBack = () => {
    const now = load(account);
    save(
      { ...now, started: now.started.filter((time) => time !== startedAt) },
      account,
    );
  };
  let reached: PictureStage = "queued";
  try {
    for (const stage of PICTURE_STAGES) {
      signal?.throwIfAborted();
      reached = stage;
      onStage?.(stage);
      await wait(delayMs);
      signal?.throwIfAborted();
      // The picture's problems show up while it's designed.
      if (fail && stage === "designing") throw new MockPictureError(fail);
    }
  } catch (error) {
    // As the API: cancelled while queued, or not the person's fault, it
    // doesn't count toward the day's limit.
    const notTheirFault =
      error instanceof MockPictureError &&
      ["unavailable", "network"].includes(error.reason);
    if (notTheirFault || reached === "queued") giveBack();
    throw error;
  }
  const { template, preview } = buildFor(picture);
  const build: PictureBuild = {
    id: newId(),
    createdAt: new Date().toISOString(),
    locale,
    title: template.title[locale],
    summary: template.summary[locale],
    steps: template.steps[locale],
    parts: template.requires,
    picture,
    preview,
  };
  const now = load(account);
  save({ ...now, builds: [build, ...now.builds] }, account);
  return build;
}

/** Newest first. */
export async function listPictureBuilds({
  delayMs = 150,
  account,
}: MockPictureOptions = {}): Promise<PictureBuild[]> {
  await wait(delayMs);
  return [...load(account).builds].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

/**
 * One build, or null. With `scanId`, its parts checked against that scan's
 * pieces as they are now; a scan that isn't there leaves `check` out.
 */
export async function getPictureBuild(
  id: string,
  {
    scanId,
    delayMs = 150,
    account,
  }: MockPictureOptions & { scanId?: string } = {},
): Promise<PictureBuild | null> {
  await wait(delayMs);
  const build = load(account).builds.find((candidate) => candidate.id === id);
  if (!build || !scanId) return build ?? null;
  const scan = await getScan(scanId, { delayMs: 0, account });
  if (!scan) return build;
  const { used, missing } = checkInventory(
    build.parts,
    toInventory(scan.detections),
  );
  return { ...build, check: { scanId, used, missing } };
}

export async function deletePictureBuild(
  id: string,
  { delayMs = 150, account }: MockPictureOptions = {},
): Promise<void> {
  await wait(delayMs);
  const stored = load(account);
  save(
    { ...stored, builds: stored.builds.filter((build) => build.id !== id) },
    account,
  );
}

/** No picture builds and a fresh day. For tests and demos. */
export function resetMockPictures(account?: string) {
  localStorage.removeItem(storageKey(account));
}
