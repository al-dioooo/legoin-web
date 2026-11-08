/* The mock service (src/lib/mock) as a backend. Demo options come from the
 * page's URL here, so screens never handle them. Browser only, like the mock.
 */
import type { Backend } from "@/lib/api/backend";
import { ApiError } from "@/lib/api/error";
import * as mock from "@/lib/mock/api";

/**
 * `?mock=fail-<reason>` and `?mockDelay=` from the page's URL, read on every
 * call. They apply to scanning and ideas, the slow steps a demo shows failing.
 */
function demoOptions(): mock.MockOptions {
  if (typeof window === "undefined") return {};
  return mock.mockOptionsFromSearch(window.location.search);
}

/** Reads and saves answer at a short, fixed pace and never fail on demand. */
const QUICK: mock.MockOptions = { delayMs: 150 };

/** The mock's failures, as the data layer's. */
async function asApiError<T>(call: Promise<T>): Promise<T> {
  try {
    return await call;
  } catch (error) {
    if (error instanceof mock.MockApiError) throw new ApiError(error.reason);
    throw error;
  }
}

export const mockBackend: Backend = {
  createScan: (photo, options) =>
    asApiError(mock.createScan(photo, { ...demoOptions(), ...options })),
  getScan: (id) => mock.getScan(id, QUICK),
  listScans: () => mock.listScans(QUICK),
  updateDetections: (id, changes) => mock.updateDetections(id, changes, QUICK),
  deleteScan: (id) => mock.deleteScan(id, QUICK),
  getIdeas: (scanId, theme, locale, options) =>
    asApiError(
      mock.getIdeas(scanId, theme, locale, { ...demoOptions(), ...options }),
    ),
  getIdea: (scanId, ideaId) => mock.getIdea(scanId, ideaId, QUICK),
};
