/* The mock service (src/lib/mock) as a backend. Demo options come from the
 * page's URL here, so screens never handle them. Browser only, like the mock.
 */
import type { Backend } from "@/lib/api/backend";
import {
  ApiError,
  AuthError,
  NotFoundError,
  UnauthorizedError,
} from "@/lib/api/error";
import { sessionToken } from "@/lib/api/session";
import * as accounts from "@/lib/mock/accounts";
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

/** The mock's failures, as the data layer's: the same errors as the API's. */
async function asApiError<T>(call: Promise<T>): Promise<T> {
  try {
    return await call;
  } catch (error) {
    if (error instanceof mock.MockApiError) throw new ApiError(error.reason);
    if (error instanceof mock.MockNotFoundError) {
      throw new NotFoundError(error.message);
    }
    throw error;
  }
}

/** The mock's log-in failures, as the API's. */
async function asAuthError<T>(call: Promise<T>): Promise<T> {
  try {
    return await call;
  } catch (error) {
    if (error instanceof accounts.MockAuthError) {
      throw new AuthError(error.reason);
    }
    // The API's `400 invalid_request`: a bug, since the forms check first.
    if (error instanceof accounts.MockInvalidError) {
      throw new Error(`The mock refused ${error.field}: ${error.message}`);
    }
    throw error;
  }
}

export const mockBackend: Backend = {
  register: ({ email, password }) =>
    asAuthError(accounts.register(email, password)),
  logIn: ({ email, password }) => asAuthError(accounts.logIn(email, password)),
  logOut: async () => accounts.logOut(sessionToken()),
  async getAccount() {
    const account = accounts.accountFor(sessionToken());
    if (!account) throw new UnauthorizedError();
    return account;
  },
  createScan: (photo, options) =>
    asApiError(mock.createScan(photo, { ...demoOptions(), ...options })),
  getScan: (id) => mock.getScan(id, QUICK),
  listScans: () => mock.listScans(QUICK),
  updateDetections: (id, changes) =>
    asApiError(mock.updateDetections(id, changes, QUICK)),
  deleteScan: (id) => mock.deleteScan(id, QUICK),
  getIdeas: (scanId, theme, locale, options) =>
    asApiError(
      mock.getIdeas(scanId, theme, locale, { ...demoOptions(), ...options }),
    ),
  getIdea: (scanId, ideaId) => mock.getIdea(scanId, ideaId, QUICK),
};
