/* The data layer over HTTP: the Legoin API as the contract describes it,
 * api/contract.md in al-dioooo/legoin-docs
 * (https://github.com/al-dioooo/legoin-docs/blob/main/api/contract.md).
 * `backendFor` picks it when NEXT_PUBLIC_API_URL is set. Browser only: the
 * browser calls the API itself, and the session lives in localStorage.
 */
import type { Backend } from "@/lib/api/backend";
import {
  ApiError,
  AuthError,
  NotFoundError,
  PictureError,
  UnauthorizedError,
} from "@/lib/api/error";
import { isSession, sessionToken } from "@/lib/api/session";
import { photoBlob, photoFileName } from "@/lib/api/upload";
import {
  type Account,
  AUTH_FAILURES,
  type AuthFailure,
  type IdeaSet,
  PICTURE_FAILURES,
  type PictureBuild,
  type PictureFailure,
  type PictureQuota,
  type PictureStage,
  SCAN_FAILURES,
  type Scan,
  type ScanFailure,
  type ScanStage,
  type StoredIdea,
} from "@/lib/domain";

/** The contract's client-side limits ("Timeouts" and "Scanning a photo"). */
export const LIMITS = {
  /** Between polls of a running scan job. */
  pollMs: 500,
  /** A scan that hasn't ended by then is given up, as `network`. */
  scanMs: 45_000,
  /** Polls in a row with no answer before a scan is given up. */
  missedPolls: 3,
  /** A request for ideas with no answer by then is aborted, as `network`. */
  ideasMs: 40_000,
  /** Most idea ids `exclude` may hold; the newest are kept. */
  exclude: 50,
  /** Between polls of a running picture job, which takes about a minute. */
  picturePollMs: 1_000,
  /** A picture build that hasn't ended by then is given up, as `network`. */
  pictureMs: 600_000,
};

/** Only on the wire: one body for every error. */
type ApiErrorBody = {
  error: { code: string; message: string; field?: string };
};

/** Only on the wire: a scan in progress, polled until it ends. */
type ScanJob =
  | { id: string; status: "running"; stage: ScanStage }
  | { id: string; status: "done"; scan: Scan }
  | { id: string; status: "failed"; error: ApiErrorBody["error"] };

/** Failures of the backend's own, which ScanFailure may not name yet. */
const SERVER_FAILURES = ["timeout", "unavailable", "internal"];

/**
 * The error for an answer that failed (contract, "Errors"):
 *
 * - `unauthorized`, or any other 401, is an UnauthorizedError: there's no
 *   valid session;
 * - `invalid_credentials`, `email_taken` and `rate_limited` are an AuthError;
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
  if ((AUTH_FAILURES as readonly unknown[]).includes(code)) {
    return new AuthError(code as AuthFailure);
  }
  if (code === "unauthorized" || status === 401) {
    return new UnauthorizedError(error?.message);
  }
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

/**
 * The error for a picture build's failed answer or job (contract, "13. Picture
 * builds"): its own codes and `unavailable` are a PictureError with that
 * reason; a session, a missing build and a bad request are as `errorFor` says;
 * anything else is `network`.
 */
function pictureErrorFor(status: number, body: unknown): Error {
  const code = (body as Partial<ApiErrorBody> | undefined)?.error?.code;
  if (
    code !== "network" &&
    (PICTURE_FAILURES as readonly unknown[]).includes(code)
  ) {
    return new PictureError(code as PictureFailure);
  }
  const error = errorFor(status, body);
  if (error instanceof ApiError) return new PictureError("network");
  return error;
}

/** Only on the wire: a picture build in progress, polled until it ends. */
type PictureJob =
  | { id: string; status: "running"; stage: PictureStage }
  | { id: string; status: "done"; build: PictureBuild }
  | { id: string; status: "failed"; error: ApiErrorBody["error"] };

function isScanJob(body: unknown): body is ScanJob {
  const job = body as Partial<ScanJob> | undefined;
  return (
    typeof job?.id === "string" &&
    (job.status === "running" ||
      job.status === "done" ||
      job.status === "failed")
  );
}

/** Waits, or rejects with `signal`'s reason as soon as it aborts. */
function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    signal.throwIfAborted();
    const stop = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", stop);
      resolve();
    }, ms);
    signal.addEventListener("abort", stop, { once: true });
  });
}

const path = (...segments: string[]) =>
  segments.map((segment) => `/${encodeURIComponent(segment)}`).join("");

type Request = RequestInit & {
  json?: unknown;
  /** False for the routes that make a session, which send no token. */
  auth?: boolean;
  /** Turns a failed answer into the error to reject with; `errorFor` by default. */
  failure?: (status: number, body: unknown) => Error;
};

function isAccount(value: unknown): value is Account {
  const account = value as Partial<Account> | null | undefined;
  return (
    typeof account?.id === "string" &&
    typeof account.email === "string" &&
    typeof account.createdAt === "string"
  );
}

export type HttpBackendOptions = {
  /** The fetch to call; tests pass a fake. */
  fetch?: typeof fetch;
  /** The session token to send; by default the kept session's. */
  token?: () => string | undefined;
};

/** A backend for the API at `baseUrl`, version included (`…/v1`). */
export function httpBackend(
  baseUrl: string,
  {
    fetch: send = (input, init) => fetch(input, init),
    token = sessionToken,
  }: HttpBackendOptions = {},
): Backend {
  const base = baseUrl.replace(/\/+$/, "");

  /** `Authorization: Bearer <token>` when someone's logged in. */
  function authorization(): Record<string, string> {
    const current = token();
    return current ? { Authorization: `Bearer ${current}` } : {};
  }

  /**
   * One request, with the session's token. Resolves with the answer's JSON, or
   * undefined when it has none. Rejects as `errorFor` says, with `network`
   * when `fetch` itself fails, or with `signal`'s reason once it aborts.
   */
  async function request(
    route: string,
    { json, auth = true, failure = errorFor, ...init }: Request = {},
  ): Promise<unknown> {
    const headers = auth ? authorization() : {};
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
      throw failure(0, undefined);
    }
    const body =
      response.status === 204
        ? undefined
        : await response.json().catch(() => undefined);
    init.signal?.throwIfAborted();
    if (!response.ok) throw failure(response.status, body);
    return body;
  }

  /** A request whose answer must be a JSON object; anything else is `network`. */
  async function object(route: string, init?: Request) {
    const body = await request(route, init);
    if (typeof body !== "object" || body === null) {
      throw (init?.failure ?? errorFor)(200, undefined);
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

  /** Sends `DELETE /scan-jobs/{id}` without waiting, even as the page unloads. */
  function cancel(jobId: string, jobs = "scan-jobs") {
    void send(`${base}${path(jobs, jobId)}`, {
      method: "DELETE",
      headers: authorization(),
      keepalive: true,
    }).catch(() => {});
  }

  /** Logging in or making an account answers a Session; anything else is `network`. */
  async function session(route: string, credentials: unknown) {
    const answer = await object(route, {
      method: "POST",
      json: credentials,
      auth: false,
    });
    if (!isSession(answer)) throw new ApiError("network");
    return answer;
  }

  return {
    register: (credentials) => session("/auth/register", credentials),

    logIn: (credentials) => session("/auth/login", credentials),

    async logOut() {
      if (!token()) return;
      await request("/auth/logout", { method: "POST" });
    },

    async getAccount() {
      const account = await object("/auth/me");
      if (!isAccount(account)) throw new ApiError("network");
      return account;
    },

    /**
     * Uploads the photo as a scan job and polls it until it ends, passing each
     * stage on. Aborting rejects with an AbortError at once and cancels the
     * job. The job is also cancelled when the scan is given up: 45 s with no
     * ending, or 3 polls in a row with no answer, which reject as `network`.
     */
    async createScan(photo, { onStage, signal }) {
      signal?.throwIfAborted();
      const giveUp = new AbortController();
      const deadline = setTimeout(() => giveUp.abort(), LIMITS.scanMs);
      const stop = signal
        ? AbortSignal.any([signal, giveUp.signal])
        : giveUp.signal;
      let jobId: string | undefined;
      try {
        const file = await photoBlob(photo, { fetch: send, signal: stop });
        const form = new FormData();
        form.append("photo", file, photoFileName(file));
        const accepted = await object("/scan-jobs", {
          method: "POST",
          body: form,
          signal: stop,
        });
        if (!isScanJob(accepted)) throw new ApiError("network");
        let job: ScanJob = accepted;
        jobId = job.id;
        let missed = 0;
        for (;;) {
          if (job.status === "done") return job.scan;
          if (job.status === "failed") {
            // The backend saved nothing, so there's nothing to cancel.
            jobId = undefined;
            throw errorFor(200, job);
          }
          onStage?.(job.stage);
          await sleep(LIMITS.pollMs, stop);
          try {
            const next = await object(path("scan-jobs", job.id), {
              signal: stop,
            });
            if (!isScanJob(next)) throw new ApiError("network");
            job = next;
            missed = 0;
          } catch (error) {
            // One poll with no answer is just retried.
            const noAnswer =
              error instanceof ApiError && error.reason === "network";
            if (!noAnswer || ++missed >= LIMITS.missedPolls) throw error;
          }
        }
      } catch (error) {
        if (jobId !== undefined) cancel(jobId);
        if (signal?.aborted) throw signal.reason;
        if (giveUp.signal.aborted) throw new ApiError("network");
        throw error;
      } finally {
        clearTimeout(deadline);
      }
    },

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

    async getPictureQuota() {
      const quota = (await object("/picture-quota", {
        failure: pictureErrorFor,
      })) as Partial<PictureQuota>;
      if (typeof quota.available !== "boolean") {
        throw new PictureError("network");
      }
      return quota as PictureQuota;
    },

    /**
     * Uploads the picture as a picture job and polls it every second until it
     * ends, passing each stage on. Aborting rejects with an AbortError at once
     * and cancels the job. The job is also cancelled when it's given up: 10
     * minutes with no ending, or 3 polls in a row with no answer, which reject
     * as `network`. Failures reject with a PictureError.
     */
    async createPictureBuild(picture, locale, { onStage, signal }) {
      signal?.throwIfAborted();
      const giveUp = new AbortController();
      const deadline = setTimeout(() => giveUp.abort(), LIMITS.pictureMs);
      const stop = signal
        ? AbortSignal.any([signal, giveUp.signal])
        : giveUp.signal;
      const failure = pictureErrorFor;
      let jobId: string | undefined;
      try {
        const file = await photoBlob(picture, { fetch: send, signal: stop });
        const form = new FormData();
        form.append("picture", file, photoFileName(file));
        form.append("locale", locale);
        const accepted = await object("/picture-jobs", {
          method: "POST",
          body: form,
          signal: stop,
          failure,
        });
        if (!isPictureJob(accepted)) throw new PictureError("network");
        let job: PictureJob = accepted;
        jobId = job.id;
        let missed = 0;
        for (;;) {
          if (job.status === "done") return job.build;
          if (job.status === "failed") {
            // The backend saved nothing, so there's nothing to cancel.
            jobId = undefined;
            throw pictureErrorFor(200, job);
          }
          onStage?.(job.stage);
          await sleep(LIMITS.picturePollMs, stop);
          try {
            const next = await object(path("picture-jobs", job.id), {
              signal: stop,
              failure,
            });
            if (!isPictureJob(next)) throw new PictureError("network");
            job = next;
            missed = 0;
          } catch (error) {
            // One poll with no answer, or a busy one, is just retried.
            const noAnswer =
              error instanceof PictureError &&
              (error.reason === "network" || error.reason === "unavailable");
            if (!noAnswer || ++missed >= LIMITS.missedPolls) {
              throw noAnswer ? new PictureError("network") : error;
            }
          }
        }
      } catch (error) {
        if (jobId !== undefined) cancel(jobId, "picture-jobs");
        if (signal?.aborted) throw signal.reason;
        if (giveUp.signal.aborted) throw new PictureError("network");
        if (error instanceof ApiError) throw new PictureError("network");
        throw error;
      } finally {
        clearTimeout(deadline);
      }
    },

    async listPictureBuilds() {
      const { builds } = (await object("/picture-builds", {
        failure: pictureErrorFor,
      })) as { builds?: unknown };
      if (!Array.isArray(builds)) throw new PictureError("network");
      return builds as PictureBuild[];
    },

    getPictureBuild: (id, { scanId }) =>
      orNull(
        object(
          `${path("picture-builds", id)}${scanId ? `?scanId=${encodeURIComponent(scanId)}` : ""}`,
          { failure: pictureErrorFor },
        ) as Promise<PictureBuild>,
      ),

    async deletePictureBuild(id) {
      await request(path("picture-builds", id), {
        method: "DELETE",
        failure: pictureErrorFor,
      });
    },
  };
}

function isPictureJob(body: unknown): body is PictureJob {
  const job = body as Partial<PictureJob> | undefined;
  return (
    typeof job?.id === "string" &&
    (job.status === "running" ||
      job.status === "done" ||
      job.status === "failed")
  );
}
