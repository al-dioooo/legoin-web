/* Mock backend for the UI until the Python API exists. It answers like the API
 * contract, api/contract.md in al-dioooo/legoin-docs
 * (https://github.com/al-dioooo/legoin-docs/blob/main/api/contract.md), where
 * it can, with the same async shape. It keeps scans in localStorage so history
 * and corrections survive reloads, one list per account, and can fake slowness
 * and failures.
 * Browser only: call it from Client Components.
 *
 * Until real detection exists, a demo photo gets its demo scan's detections and
 * any other photo gets sample pieces with no boxes (see `detectionsForPhoto`).
 */
import type { Locale } from "@/i18n/locales";
import {
  type DetectionChange,
  type Idea,
  type IdeaTheme,
  type Photo,
  SCAN_FAILURES,
  SCAN_STAGES,
  type Scan,
  type ScanFailure,
  type ScanStage,
  type StoredIdea,
  type Theme,
} from "@/lib/domain";
import {
  applyChanges,
  checkInventory,
  sameInventory,
  toInventory,
} from "@/lib/inventory";
import { BUILD_PREVIEWS } from "@/lib/mock/builds";
import {
  DEMO_SCANS,
  detectionsForPhoto,
  IDEA_TEMPLATES,
  type IdeaTemplate,
} from "@/lib/mock/fixtures";

const STORAGE_KEY = "legoin.mock.scans.v1";

export type MockOptions = {
  /** Wait per call, or per stage for scans. Defaults to a realistic pace. */
  delayMs?: number;
  /** Make the call fail with this reason. */
  fail?: ScanFailure;
  /** Whose scans: each account has its own, and starts with the demo scans. */
  account?: string;
};

/** A failed call, with the reason the screens turn into a message. */
export class MockApiError extends Error {
  constructor(readonly reason: ScanFailure) {
    super(`Mock API failed: ${reason}`);
    this.name = "MockApiError";
  }
}

/** A scan that isn't there, where the API answers `404 not_found`. */
export class MockNotFoundError extends Error {
  constructor(id: string) {
    super(`No scan with id ${id}`);
    this.name = "MockNotFoundError";
  }
}

/**
 * Options from a URL query, for demos: `?mock=fail-too_dark&mockDelay=0`.
 * Unknown values are ignored.
 */
export function mockOptionsFromSearch(search: string): MockOptions {
  const params = new URLSearchParams(search);
  const options: MockOptions = {};
  const fail = params.get("mock")?.replace(/^fail-/, "");
  if (fail && (SCAN_FAILURES as readonly string[]).includes(fail)) {
    options.fail = fail as ScanFailure;
  }
  const delay = Number(params.get("mockDelay"));
  if (params.has("mockDelay") && Number.isFinite(delay) && delay >= 0) {
    options.delayMs = delay;
  }
  return options;
}

const wait = (ms: number) =>
  ms > 0
    ? new Promise((resolve) => setTimeout(resolve, ms))
    : Promise.resolve();

const newId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const storageKey = (account?: string) =>
  account ? `${STORAGE_KEY}.${account}` : STORAGE_KEY;

function load(account?: string): Scan[] {
  const stored = localStorage.getItem(storageKey(account));
  if (stored) return JSON.parse(stored) as Scan[];
  const seeded = structuredClone(DEMO_SCANS);
  save(seeded, account);
  return seeded;
}

function save(scans: Scan[], account?: string) {
  localStorage.setItem(storageKey(account), JSON.stringify(scans));
}

async function respond<T>(
  { delayMs = 400, fail }: MockOptions,
  result: () => T,
): Promise<T> {
  await wait(delayMs);
  if (fail) throw new MockApiError(fail);
  return result();
}

/** Back to the demo scans only. For tests and demos. */
export function resetMockData(account?: string) {
  localStorage.removeItem(storageKey(account));
}

/**
 * Scans a photo, reporting each pipeline stage, and saves the result.
 * Aborting through `signal` rejects with an AbortError and saves nothing.
 */
export async function createScan(
  photo: Photo,
  {
    delayMs = 900,
    fail,
    account,
    onStage,
    signal,
  }: MockOptions & {
    onStage?: (stage: ScanStage) => void;
    signal?: AbortSignal;
  } = {},
): Promise<Scan> {
  for (const stage of SCAN_STAGES) {
    signal?.throwIfAborted();
    onStage?.(stage);
    await wait(delayMs);
    signal?.throwIfAborted();
    // Network trouble shows up early; problems with the photo after detection.
    if (fail === "network" || (fail && stage === "detecting")) {
      throw new MockApiError(fail);
    }
  }
  const scan: Scan = {
    id: newId(),
    createdAt: new Date().toISOString(),
    photo,
    detections: detectionsForPhoto(photo.src).map((detection) => ({
      ...detection,
      id: newId(),
    })),
  };
  save([scan, ...load(account)], account);
  return scan;
}

export function getScan(id: string, options: MockOptions = {}) {
  return respond(
    options,
    () => load(options.account).find((scan) => scan.id === id) ?? null,
  );
}

/** Newest first. */
export function listScans(options: MockOptions = {}) {
  return respond(options, () =>
    [...load(options.account)].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    ),
  );
}

/**
 * Applies corrections and returns the updated scan. Kept ideas were checked
 * against the pieces as they were, so a correction that changes the inventory
 * drops them; the next request for ideas checks the corrected pieces. One that
 * leaves it as it was, like confirming a flagged piece, keeps them. Either way
 * `lastTheme` stays.
 */
export function updateDetections(
  id: string,
  changes: DetectionChange[],
  options: MockOptions = {},
) {
  return respond(options, () => {
    const scans = load(options.account);
    const scan = scans.find((candidate) => candidate.id === id);
    if (!scan) throw new MockNotFoundError(id);
    const before = scan.detections;
    scan.detections = applyChanges(before, changes, newId);
    if (!sameInventory(before, scan.detections)) delete scan.ideas;
    save(scans, options.account);
    return scan;
  });
}

export function deleteScan(id: string, options: MockOptions = {}) {
  return respond(options, () => {
    save(
      load(options.account).filter((scan) => scan.id !== id),
      options.account,
    );
  });
}

const IDEAS_PER_REQUEST = 3;

/** A template's checked build, as the API sends it: `buildId` and `preview` together, or neither. */
function buildOf(id: string): Pick<Idea, "buildId" | "preview"> {
  const preview = BUILD_PREVIEWS[id];
  return preview ? { buildId: id, preview } : {};
}

/** Ideas not shown yet first, in template order; then shown ones, longest ago first. */
function freshFirst(templates: IdeaTemplate[], exclude: readonly string[]) {
  const fresh = templates.filter((template) => !exclude.includes(template.id));
  const shown = exclude.flatMap((id) =>
    templates.filter((template) => template.id === id),
  );
  return [...fresh, ...shown];
}

/**
 * Three ideas for a scan, in the requested language, each checked against the
 * scan's inventory. "surprise" picks one idea from every theme. The answer is
 * saved on the scan as its `ideas`, replacing the ones before. A scan with no
 * pieces fails with `no_pieces` and keeps what it had, as the API does.
 *
 * For "Try other ideas", `exclude` lists the ids already shown, oldest first.
 * Ideas not shown yet come first; once they run out, the ones shown longest ago.
 */
export function getIdeas(
  scanId: string,
  theme: Theme,
  locale: Locale,
  {
    exclude = [],
    ...options
  }: MockOptions & { exclude?: readonly string[] } = {},
): Promise<Idea[]> {
  return respond({ delayMs: 1200, ...options }, () => {
    const scans = load(options.account);
    const scan = scans.find((candidate) => candidate.id === scanId);
    if (!scan) throw new MockNotFoundError(scanId);

    const inventory = toInventory(scan.detections);
    // The API answers 409 no_pieces rather than ideas with every part missing.
    if (inventory.length === 0) throw new MockApiError("no_pieces");
    const ofTheme = (ideaTheme: IdeaTheme) =>
      freshFirst(
        IDEA_TEMPLATES.filter((template) => template.theme === ideaTheme),
        exclude,
      );
    const templates =
      theme === "surprise"
        ? (["vehicles", "animals", "buildings"] satisfies IdeaTheme[]).map(
            (ideaTheme) => ofTheme(ideaTheme)[0],
          )
        : ofTheme(theme).slice(0, IDEAS_PER_REQUEST);

    const ideas: Idea[] = templates
      .filter((template) => template !== undefined)
      .map((template) => ({
        id: template.id,
        theme: template.theme,
        difficulty: template.difficulty,
        title: template.title[locale],
        summary: template.summary[locale],
        steps: template.steps[locale],
        ...checkInventory(template.requires, inventory),
        ...buildOf(template.id),
      }));

    scan.lastTheme = theme;
    scan.ideas = { theme, locale, items: ideas };
    save(scans, options.account);
    return ideas;
  });
}

/**
 * One idea from the scan's latest set, with that set, exactly as it was
 * written: an idea asked for in English stays English. Null when the scan is
 * gone, or its latest set was replaced or dropped and has no idea with this id.
 */
export function getIdea(
  scanId: string,
  ideaId: string,
  options: MockOptions = {},
): Promise<StoredIdea | null> {
  return respond(options, () => {
    const set = load(options.account).find((scan) => scan.id === scanId)?.ideas;
    const idea = set?.items.find((item) => item.id === ideaId);
    return set && idea ? { idea, set } : null;
  });
}
