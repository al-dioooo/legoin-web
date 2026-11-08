/* What serves the data layer, and the one place that picks it. The HTTP client
 * goes here once the API contract (al-dioooo/legoin-docs#7) is written.
 */
import type { Locale } from "@/i18n/locales";
import { mockBackend } from "@/lib/api/mock-backend";
import {
  type DetectionChange,
  type Idea,
  type Photo,
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

/** Everything a backend provides: the mock now, an HTTP client later. */
export type Backend = {
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
};

/**
 * The backend for `NEXT_PUBLIC_API_URL`: the mock when it's unset or empty.
 * There's no HTTP client yet, so a URL throws instead of quietly using the mock.
 */
export function backendFor(apiUrl: string | undefined): Backend {
  if (!apiUrl?.trim()) return mockBackend;
  throw new Error(
    `NEXT_PUBLIC_API_URL is set to "${apiUrl}", but legoin-web has no HTTP client yet. Leave it empty to use the mock backend.`,
  );
}

/**
 * Passes each stage on once, in pipeline order, so a backend that polls can
 * report the current stage on every poll. Repeats and steps back are dropped;
 * a stage the backend never reported is skipped.
 */
export function inOrder(onStage: (stage: ScanStage) => void) {
  let reached = -1;
  return (stage: ScanStage) => {
    const index = SCAN_STAGES.indexOf(stage);
    if (index <= reached) return;
    reached = index;
    onStage(stage);
  };
}
