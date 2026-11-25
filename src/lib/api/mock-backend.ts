/* The mock service (src/lib/mock) as a backend. Demo options come from the
 * page's URL here, so screens never handle them. Browser only, like the mock.
 */
import type { Backend } from "@/lib/api/backend";
import {
  ApiError,
  AuthError,
  NotFoundError,
  PictureError,
  UnauthorizedError,
} from "@/lib/api/error";
import { sessionToken } from "@/lib/api/session";
import * as accounts from "@/lib/mock/accounts";
import * as mock from "@/lib/mock/api";
import * as pictures from "@/lib/mock/pictures";

/**
 * `?mock=fail-<reason>` and `?mockDelay=` from the page's URL, read on every
 * call. They apply to scanning and ideas, the slow steps a demo shows failing.
 */
function demoOptions(): mock.MockOptions {
  if (typeof window === "undefined") return {};
  return mock.mockOptionsFromSearch(window.location.search);
}

/** Picture reads and deletes, at the same short pace. */
const QUICK_PICTURES: pictures.MockPictureOptions = { delayMs: 150 };

/** `?mock=fail-<reason>` and `?mockDelay=` for picture builds. */
function pictureOptions(): pictures.MockPictureOptions {
  if (typeof window === "undefined") return {};
  return pictures.pictureOptionsFromSearch(window.location.search);
}

/** The mock's picture failures, as the data layer's. */
async function asPictureError<T>(call: Promise<T>): Promise<T> {
  try {
    return await call;
  } catch (error) {
    if (error instanceof pictures.MockPictureError) {
      throw new PictureError(error.reason);
    }
    throw error;
  }
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

/**
 * The logged-in account's id, for the mock's per-account scans. Like the API,
 * a call without a valid session rejects with an UnauthorizedError.
 */
function owner(): string {
  const account = accounts.accountFor(sessionToken());
  if (!account) throw new UnauthorizedError();
  return account.id;
}

/** Runs `call` with the owner, so a missing session rejects instead of throwing. */
const asOwner = <T>(call: (account: string) => Promise<T>): Promise<T> =>
  Promise.resolve().then(() => call(owner()));

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
    asOwner((account) =>
      asApiError(
        mock.createScan(photo, { ...demoOptions(), ...options, account }),
      ),
    ),
  getScan: (id) =>
    asOwner((account) => mock.getScan(id, { ...QUICK, account })),
  listScans: () => asOwner((account) => mock.listScans({ ...QUICK, account })),
  updateDetections: (id, changes) =>
    asOwner((account) =>
      asApiError(mock.updateDetections(id, changes, { ...QUICK, account })),
    ),
  deleteScan: (id) =>
    asOwner((account) => mock.deleteScan(id, { ...QUICK, account })),
  getIdeas: (scanId, theme, locale, options) =>
    asOwner((account) =>
      asApiError(
        mock.getIdeas(scanId, theme, locale, {
          ...demoOptions(),
          ...options,
          account,
        }),
      ),
    ),
  getIdea: (scanId, ideaId) =>
    asOwner((account) => mock.getIdea(scanId, ideaId, { ...QUICK, account })),
  getPictureQuota: () =>
    asOwner((account) =>
      pictures.getPictureQuota({ ...QUICK_PICTURES, account }),
    ),
  createPictureBuild: (picture, locale, options) =>
    asOwner((account) =>
      asPictureError(
        pictures.createPictureBuild(picture, locale, {
          ...pictureOptions(),
          ...options,
          account,
        }),
      ),
    ),
  listPictureBuilds: () =>
    asOwner((account) =>
      pictures.listPictureBuilds({ ...QUICK_PICTURES, account }),
    ),
  getPictureBuild: (id, { scanId }) =>
    asOwner((account) =>
      pictures.getPictureBuild(id, { ...QUICK_PICTURES, scanId, account }),
    ),
  deletePictureBuild: (id) =>
    asOwner((account) =>
      pictures.deletePictureBuild(id, { ...QUICK_PICTURES, account }),
    ),
};
