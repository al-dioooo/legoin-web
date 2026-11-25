/* The data layer over HTTP: the Legoin API as the contract describes it,
 * api/contract.md in al-dioooo/legoin-docs
 * (https://github.com/al-dioooo/legoin-docs/blob/main/api/contract.md).
 * `backendFor` picks it when NEXT_PUBLIC_API_URL is set. Browser only: the
 * browser calls the API itself, and the device id lives in localStorage.
 */
import type { Backend } from "@/lib/api/backend";
import { deviceId as storedDeviceId } from "@/lib/api/device-id";
import { ApiError, NotFoundError } from "@/lib/api/error";
import {
  type IdeaSet,
  SCAN_FAILURES,
  type Scan,
  type ScanFailure,
  type StoredIdea,
} from "@/lib/domain";

/** The contract's client-side limits ("Timeouts"). */
export const LIMITS = {
  /** A request for ideas with no answer by then is aborted, as `network`. */
  ideasMs: 40_000,
  /** Most idea ids `exclude` may hold; the newest are kept. */
  exclude: 50,
};

/** Only on the wire: one body for every error. */
type ApiErrorBody = {
  error: { code: string; message: string; field?: string };
};

/** Failures of the backend's own, which ScanFailure may not name yet. */
const SERVER_FAILURES = ["timeout", "unavailable", "internal"];

/**
 * The error for an answer that failed (contract, "Errors"):
 *
 * - a code that names a ScanFailure is that reason, so `timeout` passes
 *   through once ScanFailure has it;
 * - `not_found` is a NotFoundError;
 * - the backend's own failures, any 5xx, and a body with no code are
 *   `network`, as if there were no answer;
 * - anything else, such as `invalid_request`, is a bug in the request: a plain
 *   Error, for which screens show their generic message.
 */
function errorFor(status: number, body: unknown): Error {
  const error = (body as Partial<ApiErrorBody> | undefined)?.error;
  const code = error?.code;
  if (
    code !== "network" &&
    (SCAN_FAILURES as readonly unknown[]).includes(code)
  ) {
    return new ApiError(code as ScanFailure);
  }
  if (code === "not_found") return new NotFoundError(error?.message);
  if (
    typeof code !== "string" ||
    status >= 500 ||
    SERVER_FAILURES.includes(code)
  ) {
    return new ApiError("network");
  }
  return new Error(`The API answered ${status} ${code}: ${error?.message}`);
}

const path = (...segments: string[]) =>
  segments.map((segment) => `/${encodeURIComponent(segment)}`).join("");

type Request = RequestInit & { json?: unknown };

export type HttpBackendOptions = {
  /** The fetch to call; tests pass a fake. */
  fetch?: typeof fetch;
  /** The `Legoin-Device-Id` to send; by default this device's, from localStorage. */
  deviceId?: () => string;
};

/** A backend for the API at `baseUrl`, version included (`…/v1`). */
export function httpBackend(
  baseUrl: string,
  {
    fetch: send = (input, init) => fetch(input, init),
    deviceId = storedDeviceId,
  }: HttpBackendOptions = {},
): Backend {
  const base = baseUrl.replace(/\/+$/, "");

  /**
   * One request, with the device id. Resolves with the answer's JSON, or
   * undefined when it has none. Rejects as `errorFor` says, with `network`
   * when `fetch` itself fails, or with `signal`'s reason once it aborts.
   */
  async function request(
    route: string,
    { json, ...init }: Request = {},
  ): Promise<unknown> {
    const headers: Record<string, string> = { "Legoin-Device-Id": deviceId() };
    if (json !== undefined) headers["Content-Type"] = "application/json";
    let response: Response;
    try {
      response = await send(`${base}${route}`, {
        ...init,
        headers,
        body: json === undefined ? init.body : JSON.stringify(json),
      });
    } catch {
      init.signal?.throwIfAborted();
      throw new ApiError("network");
    }
    const body =
      response.status === 204
        ? undefined
        : await response.json().catch(() => undefined);
    init.signal?.throwIfAborted();
    if (!response.ok) throw errorFor(response.status, body);
    return body;
  }

  /** A request whose answer must be a JSON object; anything else is `network`. */
  async function object(route: string, init?: Request) {
    const body = await request(route, init);
    if (typeof body !== "object" || body === null) {
      throw new ApiError("network");
    }
    return body;
  }

  /** For `getScan` and `getIdea`, which answer null for `404 not_found`. */
  async function orNull<T>(answer: Promise<T>): Promise<T | null> {
    try {
      return await answer;
    } catch (error) {
      if (error instanceof NotFoundError) return null;
      throw error;
    }
  }

  return {
    // Scanning comes in the next commit: upload, then poll the scan job.
    createScan: () =>
      Promise.reject(new Error("Scanning over HTTP isn't written yet")),

    getScan: (id) => orNull(object(path("scans", id)) as Promise<Scan>),

    async listScans() {
      const { scans } = (await object("/scans")) as { scans?: unknown };
      if (!Array.isArray(scans)) throw new ApiError("network");
      return scans as Scan[];
    },

    async updateDetections(id, changes) {
      return (await object(path("scans", id, "detections"), {
        method: "PATCH",
        json: { changes },
      })) as Scan;
    },

    async deleteScan(id) {
      await request(path("scans", id), { method: "DELETE" });
    },

    /**
     * Asks for ideas and resolves with the set's items. With no answer after
     * 40 s the request is aborted and rejects as `network`.
     */
    async getIdeas(scanId, theme, locale, { exclude }) {
      const giveUp = new AbortController();
      const deadline = setTimeout(() => giveUp.abort(), LIMITS.ideasMs);
      try {
        const set = (await object(path("scans", scanId, "ideas"), {
          method: "POST",
          json: exclude?.length
            ? { theme, locale, exclude: exclude.slice(-LIMITS.exclude) }
            : { theme, locale },
          signal: giveUp.signal,
        })) as Partial<IdeaSet>;
        if (!Array.isArray(set.items)) throw new ApiError("network");
        return set.items;
      } catch (error) {
        if (giveUp.signal.aborted) throw new ApiError("network");
        throw error;
      } finally {
        clearTimeout(deadline);
      }
    },

    getIdea: (scanId, ideaId) =>
      orNull(
        object(path("scans", scanId, "ideas", ideaId)) as Promise<StoredIdea>,
      ),
  };
}
