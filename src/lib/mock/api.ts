/* Mock backend for the UI until the Python API exists (al-dioooo/legoin-docs#7).
 * It has the async shape the real client will have, keeps scans in localStorage
 * so history and corrections survive reloads, and can fake slowness and failures.
 * Browser only: call it from Client Components.
 *
 * Until real detection exists, a new photo gets a demo scan's detections, so the
 * boxes only line up on the demo photos.
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
  type Theme,
} from "@/lib/domain";
import { applyChanges, checkInventory, toInventory } from "@/lib/inventory";
import {
  DEMO_SCANS,
  detectionsForPhoto,
  IDEA_TEMPLATES,
} from "@/lib/mock/fixtures";

const STORAGE_KEY = "legoin.mock.scans.v1";

export type MockOptions = {
  /** Wait per call, or per stage for scans. Defaults to a realistic pace. */
  delayMs?: number;
  /** Make the call fail with this reason. */
  fail?: ScanFailure;
};

/** A failed call, with the reason the screens turn into a message. */
export class MockApiError extends Error {
  constructor(readonly reason: ScanFailure) {
    super(`Mock API failed: ${reason}`);
    this.name = "MockApiError";
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

function load(): Scan[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored) as Scan[];
  const seeded = structuredClone(DEMO_SCANS);
  save(seeded);
  return seeded;
}

function save(scans: Scan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
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
export function resetMockData() {
  localStorage.removeItem(STORAGE_KEY);
}

/** Scans a photo, reporting each pipeline stage, and saves the result. */
export async function createScan(
  photo: Photo,
  {
    delayMs = 900,
    fail,
    onStage,
  }: MockOptions & { onStage?: (stage: ScanStage) => void } = {},
): Promise<Scan> {
  for (const stage of SCAN_STAGES) {
    onStage?.(stage);
    await wait(delayMs);
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
  save([scan, ...load()]);
  return scan;
}

export function getScan(id: string, options: MockOptions = {}) {
  return respond(options, () => load().find((scan) => scan.id === id) ?? null);
}

/** Newest first. */
export function listScans(options: MockOptions = {}) {
  return respond(options, () =>
    [...load()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
}

/** Applies corrections and returns the updated scan. */
export function updateDetections(
  id: string,
  changes: DetectionChange[],
  options: MockOptions = {},
) {
  return respond(options, () => {
    const scans = load();
    const scan = scans.find((candidate) => candidate.id === id);
    if (!scan) throw new Error(`No scan with id ${id}`);
    scan.detections = applyChanges(scan.detections, changes, newId);
    save(scans);
    return scan;
  });
}

export function deleteScan(id: string, options: MockOptions = {}) {
  return respond(options, () => {
    save(load().filter((scan) => scan.id !== id));
  });
}

/**
 * Three ideas for a scan, in the requested language, each checked against the
 * scan's inventory. "surprise" picks the first idea of every theme.
 */
export function getIdeas(
  scanId: string,
  theme: Theme,
  locale: Locale,
  options: MockOptions = {},
): Promise<Idea[]> {
  return respond({ delayMs: 1200, ...options }, () => {
    const scans = load();
    const scan = scans.find((candidate) => candidate.id === scanId);
    if (!scan) throw new Error(`No scan with id ${scanId}`);
    scan.lastTheme = theme;
    save(scans);

    const inventory = toInventory(scan.detections);
    const templates =
      theme === "surprise"
        ? (["vehicles", "animals", "buildings"] satisfies IdeaTheme[]).map(
            (ideaTheme) =>
              IDEA_TEMPLATES.find((template) => template.theme === ideaTheme),
          )
        : IDEA_TEMPLATES.filter((template) => template.theme === theme);

    return templates
      .filter((template) => template !== undefined)
      .map((template) => ({
        id: template.id,
        theme: template.theme,
        difficulty: template.difficulty,
        title: template.title[locale],
        summary: template.summary[locale],
        steps: template.steps[locale],
        ...checkInventory(template.requires, inventory),
      }));
  });
}
