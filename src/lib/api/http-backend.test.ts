// @vitest-environment node
/* Contract tests for the HTTP client (ADR-0007): a fake fetch answers with the
 * API contract's own examples, and each test checks one rule of
 * api/contract.md. There's no backend yet, so this is the only check.
 */
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  ACCOUNT,
  BASE_URL,
  CORRECTED_SCAN,
  CORRECTION,
  IDEA_SET,
  IDEAS_REQUEST,
  INVALID_REQUEST,
  JOB_ACCEPTED,
  JOB_DONE,
  JOB_FAILED,
  JOB_RUNNING,
  PICTURE_BUILD,
  PICTURE_BUILD_CHECKED,
  PICTURE_JOB_ACCEPTED,
  PICTURE_JOB_DONE,
  PICTURE_JOB_FAILED,
  PICTURE_QUOTA,
  REGISTER_REQUEST,
  SCAN_LIST,
  SCAN_NOT_FOUND,
  SESSION,
  STORED_IDEA,
  TOKEN,
} from "@/lib/api/contract-examples";
import {
  ApiError,
  AuthError,
  NotFoundError,
  PictureError,
  UnauthorizedError,
} from "@/lib/api/error";
import { httpBackend, LIMITS } from "@/lib/api/http-backend";
import { type PictureStage, SCAN_FAILURES, type ScanStage } from "@/lib/domain";

type Seen = { method: string; path: string; init: RequestInit };
type Answer = (request: Seen) => Response | Promise<Response>;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const noContent = () => new Response(null, { status: 204 });
const offline = () => Promise.reject(new TypeError("Failed to fetch"));
const silent = () => new Promise<Response>(() => {});
const error = (code: string, status: number) =>
  json({ error: { code, message: `A ${code} error.` } }, status);

/**
 * The API, faked: `answer` replies to each request, which is recorded with its
 * path under the base URL. Like a real fetch, a request rejects once its
 * signal aborts.
 */
function fakeApi(answer: Answer) {
  const seen: Seen[] = [];
  const fetch = vi.fn((input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = String(input);
    const request: Seen = {
      method: init.method ?? "GET",
      path: url.startsWith(BASE_URL) ? url.slice(BASE_URL.length) : url,
      init,
    };
    seen.push(request);
    return new Promise<Response>((resolve, reject) => {
      init.signal?.throwIfAborted();
      init.signal?.addEventListener("abort", () => reject(init.signal?.reason));
      Promise.resolve(request).then(answer).then(resolve, reject);
    });
  });
  const backend = httpBackend(BASE_URL, {
    fetch: fetch as typeof globalThis.fetch,
    token: () => TOKEN,
  });
  return { backend, seen, fetch };
}

/** Answers each request with the next of `answers`, then the last again. */
function inTurn(...answers: Answer[]): Answer {
  let next = 0;
  return (request) => answers[Math.min(next++, answers.length - 1)](request);
}

const headers = (request: Seen) =>
  request.init.headers as Record<string, string>;
const requests = (seen: Seen[]) =>
  seen.map(({ method, path }) => `${method} ${path}`);

/** Settles a promise for `expect`, so fake timers can run while it waits. */
const outcome = <T>(promise: Promise<T>) =>
  promise.then(
    (value) => ({ value }),
    (reason: unknown) => ({ reason }),
  );

const PHOTO = {
  src: "data:image/jpeg;base64,/9j/4AAQ",
  width: 1200,
  height: 800,
};

describe("accounts", () => {
  test("register posts the credentials with no token and resolves with the session", async () => {
    const api = fakeApi(() => json(SESSION, 201));
    expect(await api.backend.register(REGISTER_REQUEST)).toEqual(SESSION);
    expect(requests(api.seen)).toEqual(["POST /auth/register"]);
    expect(JSON.parse(String(api.seen[0].init.body))).toEqual(REGISTER_REQUEST);
    expect(headers(api.seen[0])).toEqual({
      "Content-Type": "application/json",
    });
  });

  test("logIn leaves deviceId out when there's none, and rejects the log-in codes as AuthErrors", async () => {
    const api = fakeApi(
      inTurn(
        () => json(SESSION),
        () => error("invalid_credentials", 401),
        () => error("rate_limited", 429),
        () => error("email_taken", 409),
      ),
    );
    const credentials = { email: "ana@example.com", password: "baseplate-2x4" };
    expect(await api.backend.logIn(credentials)).toEqual(SESSION);
    expect(JSON.parse(String(api.seen[0].init.body))).toEqual(credentials);
    await expect(api.backend.logIn(credentials)).rejects.toEqual(
      new AuthError("invalid_credentials"),
    );
    await expect(api.backend.logIn(credentials)).rejects.toEqual(
      new AuthError("rate_limited"),
    );
    await expect(api.backend.register(credentials)).rejects.toEqual(
      new AuthError("email_taken"),
    );
    expect(requests(api.seen).at(-1)).toBe("POST /auth/register");
  });

  test("an answer that isn't a session is network", async () => {
    const api = fakeApi(() => json({ token: TOKEN }, 201));
    await expect(api.backend.register(REGISTER_REQUEST)).rejects.toEqual(
      new ApiError("network"),
    );
  });

  test("logOut posts the token, and sends nothing without one", async () => {
    const api = fakeApi(() => noContent());
    await api.backend.logOut();
    expect(requests(api.seen)).toEqual(["POST /auth/logout"]);
    expect(headers(api.seen[0])).toEqual({ Authorization: `Bearer ${TOKEN}` });

    const fetch = vi.fn();
    await httpBackend(BASE_URL, { fetch, token: () => undefined }).logOut();
    expect(fetch).not.toHaveBeenCalled();
  });

  test("getAccount reads /auth/me, and a 401 is an UnauthorizedError", async () => {
    const api = fakeApi(
      inTurn(
        () => json(ACCOUNT),
        () => error("unauthorized", 401),
      ),
    );
    expect(await api.backend.getAccount()).toEqual(ACCOUNT);
    expect(requests(api.seen)).toEqual(["GET /auth/me"]);
    await expect(api.backend.getAccount()).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  test("any route answering 401 rejects with an UnauthorizedError, and without a session no token is sent", async () => {
    const seen: RequestInit[] = [];
    const backend = httpBackend(BASE_URL, {
      fetch: (async (_input: RequestInfo | URL, init: RequestInit = {}) => {
        seen.push(init);
        return new Response(null, { status: 401 });
      }) as typeof fetch,
      token: () => undefined,
    });
    await expect(backend.listScans()).rejects.toBeInstanceOf(UnauthorizedError);
    await expect(backend.getScan("scn_4kd2p9")).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    expect(seen.map((init) => init.headers)).toEqual([{}, {}]);
  });
});

describe("scanning a photo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  /** Polls answer with `polls` in turn, after the upload's 202. */
  function scanning(...polls: Answer[]) {
    const api = fakeApi((request) =>
      request.method === "POST"
        ? json(JOB_ACCEPTED, 202)
        : request.method === "DELETE"
          ? noContent()
          : polled(request),
    );
    const polled = inTurn(...polls);
    const stages: ScanStage[] = [];
    const controller = new AbortController();
    const result = outcome(
      api.backend.createScan(PHOTO, {
        onStage: (stage) => stages.push(stage),
        signal: controller.signal,
      }),
    );
    return { ...api, stages, controller, result };
  }

  test("uploads the photo as a job, polls it every 500 ms and resolves with the scan", async () => {
    const scan = scanning(
      () => json(JOB_RUNNING),
      () => json(JOB_DONE),
    );
    await vi.advanceTimersByTimeAsync(2 * LIMITS.pollMs);
    expect(await scan.result).toEqual({ value: JOB_DONE.scan });
    expect(scan.stages).toEqual(["detecting", "classifying"]);
    expect(requests(scan.seen)).toEqual([
      "POST /scan-jobs",
      "GET /scan-jobs/job_8c1f2e",
      "GET /scan-jobs/job_8c1f2e",
    ]);
    for (const request of scan.seen) {
      expect(headers(request).Authorization).toBe(`Bearer ${TOKEN}`);
    }

    // The photo goes as a multipart part named `photo`; fetch sets the type.
    const upload = scan.seen[0].init;
    expect(headers(scan.seen[0])["Content-Type"]).toBeUndefined();
    const part = (upload.body as FormData).get("photo") as File;
    expect(part.name).toBe("photo.jpg");
    expect(part.type).toBe("image/jpeg");
    expect([...new Uint8Array(await part.arrayBuffer())]).toEqual([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10,
    ]);
  });

  test("the sample photo is fetched from the site, without the token, and uploaded", async () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff]);
    const api = fakeApi((request) =>
      request.path === "/contoh/kepingan-2.jpg"
        ? new Response(jpeg, { headers: { "Content-Type": "image/jpeg" } })
        : request.method === "POST"
          ? json(JOB_ACCEPTED, 202)
          : json(JOB_DONE),
    );
    const scan = outcome(
      api.backend.createScan(
        { src: "/contoh/kepingan-2.jpg", width: 1200, height: 800 },
        {},
      ),
    );
    await vi.advanceTimersByTimeAsync(LIMITS.pollMs);
    expect(await scan).toEqual({ value: JOB_DONE.scan });
    expect(api.seen[0].init.headers).toBeUndefined();
    const part = (api.seen[1].init.body as FormData).get("photo") as File;
    expect([...new Uint8Array(await part.arrayBuffer())]).toEqual([...jpeg]);
  });

  test("a failed job rejects with its reason, and isn't cancelled", async () => {
    const scan = scanning(() => json(JOB_FAILED));
    await vi.advanceTimersByTimeAsync(LIMITS.pollMs);
    expect(await scan.result).toEqual({ reason: new ApiError("too_dark") });
    expect(requests(scan.seen)).not.toContain("DELETE /scan-jobs/job_8c1f2e");
  });

  // "ScanFailure reasons": a code that names a reason is that reason; the
  // backend's own failures are `network` until ScanFailure has a reason for
  // them, as the contract says of `timeout`.
  test.each([
    "no_pieces",
    "too_dark",
    "too_blurry",
    "timeout",
    "unavailable",
    "internal",
  ])("a job that failed with %s rejects with the reason the contract gives", async (code) => {
    const reason = (SCAN_FAILURES as readonly string[]).includes(code)
      ? code
      : "network";
    const scan = scanning(() =>
      json({ ...JOB_FAILED, error: { code, message: "Failed." } }),
    );
    await vi.advanceTimersByTimeAsync(LIMITS.pollMs);
    expect(await scan.result).toEqual({
      reason: new ApiError(reason as "network"),
    });
  });

  test("aborting stops polling, rejects with an AbortError at once and deletes the job with keepalive", async () => {
    const scan = scanning(() => json(JOB_RUNNING));
    await vi.advanceTimersByTimeAsync(LIMITS.pollMs + 100);
    scan.controller.abort();
    const { reason } = (await scan.result) as { reason: Error };
    expect(reason.name).toBe("AbortError");
    await vi.advanceTimersByTimeAsync(10 * LIMITS.pollMs);
    expect(requests(scan.seen)).toEqual([
      "POST /scan-jobs",
      "GET /scan-jobs/job_8c1f2e",
      "DELETE /scan-jobs/job_8c1f2e",
    ]);
    const cancel = scan.seen[2];
    expect(cancel.init.keepalive).toBe(true);
    expect(headers(cancel).Authorization).toBe(`Bearer ${TOKEN}`);
  });

  test("aborting during the upload rejects at once, with no job to delete", async () => {
    const api = fakeApi(silent);
    const controller = new AbortController();
    const scan = outcome(
      api.backend.createScan(PHOTO, { signal: controller.signal }),
    );
    await vi.advanceTimersByTimeAsync(0);
    controller.abort();
    const { reason } = (await scan) as { reason: Error };
    expect(reason.name).toBe("AbortError");
    expect(requests(api.seen)).toEqual(["POST /scan-jobs"]);
  });

  test("one poll with no answer is retried; three in a row give up as network and delete the job", async () => {
    const scan = scanning(
      offline,
      () => json(JOB_RUNNING),
      offline,
      () => error("unavailable", 503),
      () => new Response("<html>Bad gateway</html>", { status: 502 }),
    );
    await vi.advanceTimersByTimeAsync(5 * LIMITS.pollMs);
    expect(await scan.result).toEqual({ reason: new ApiError("network") });
    expect(requests(scan.seen)).toEqual([
      "POST /scan-jobs",
      ...Array(5).fill("GET /scan-jobs/job_8c1f2e"),
      "DELETE /scan-jobs/job_8c1f2e",
    ]);
  });

  test("a scan with no ending after 45 s gives up as network and deletes the job", async () => {
    const scan = scanning(() => json(JOB_RUNNING));
    await vi.advanceTimersByTimeAsync(LIMITS.scanMs - LIMITS.pollMs);
    expect(requests(scan.seen)).not.toContain("DELETE /scan-jobs/job_8c1f2e");
    await vi.advanceTimersByTimeAsync(LIMITS.pollMs);
    expect(await scan.result).toEqual({ reason: new ApiError("network") });
    expect(requests(scan.seen).at(-1)).toBe("DELETE /scan-jobs/job_8c1f2e");
  });

  test("45 s count a poll that never answers too", async () => {
    const scan = scanning(silent);
    await vi.advanceTimersByTimeAsync(LIMITS.scanMs);
    expect(await scan.result).toEqual({ reason: new ApiError("network") });
    expect(requests(scan.seen)).toEqual([
      "POST /scan-jobs",
      "GET /scan-jobs/job_8c1f2e",
      "DELETE /scan-jobs/job_8c1f2e",
    ]);
  });
});

describe("scans", () => {
  test("getScan reads one scan, and turns 404 not_found into null", async () => {
    const api = fakeApi(
      inTurn(
        () => json(JOB_DONE.scan),
        () => json(SCAN_NOT_FOUND, 404),
      ),
    );
    expect(await api.backend.getScan("scn_4kd2p9")).toEqual(JOB_DONE.scan);
    expect(await api.backend.getScan("scn_4kd2p9")).toBeNull();
    expect(requests(api.seen)).toEqual([
      "GET /scans/scn_4kd2p9",
      "GET /scans/scn_4kd2p9",
    ]);
    expect(headers(api.seen[0])).toEqual({ Authorization: `Bearer ${TOKEN}` });
  });

  test("listScans unwraps { scans }, newest first as the API sends them", async () => {
    const api = fakeApi(
      inTurn(
        () => json(SCAN_LIST),
        () => json({ scans: [] }),
      ),
    );
    expect(await api.backend.listScans()).toEqual(SCAN_LIST.scans);
    expect(await api.backend.listScans()).toEqual([]);
    expect(requests(api.seen)[0]).toBe("GET /scans");
  });

  test("updateDetections sends the changes as JSON and resolves with the updated scan", async () => {
    const api = fakeApi(() => json(CORRECTED_SCAN));
    const scan = await api.backend.updateDetections("scn_4kd2p9", [
      ...CORRECTION.changes,
    ]);
    expect(scan).toEqual(CORRECTED_SCAN);
    const [patch] = api.seen;
    expect(requests(api.seen)).toEqual(["PATCH /scans/scn_4kd2p9/detections"]);
    expect(headers(patch)["Content-Type"]).toBe("application/json");
    expect(JSON.parse(patch.init.body as string)).toEqual(CORRECTION);
  });

  test("updateDetections rejects a gone scan with a NotFoundError, and an invalid change as a bug", async () => {
    const api = fakeApi(
      inTurn(
        () => json(SCAN_NOT_FOUND, 404),
        () => json(INVALID_REQUEST, 400),
      ),
    );
    const change = [{ type: "remove", id: "det_a1" }] as const;
    await expect(
      api.backend.updateDetections("scn_4kd2p9", [...change]),
    ).rejects.toBeInstanceOf(NotFoundError);
    const bug = await api.backend
      .updateDetections("scn_4kd2p9", [...change])
      .catch((caught: Error) => caught);
    expect(bug).toBeInstanceOf(Error);
    expect(bug).not.toBeInstanceOf(ApiError);
    expect(String(bug)).toContain("invalid_request");
  });

  test("deleteScan sends DELETE and takes the 204", async () => {
    const api = fakeApi(noContent);
    await expect(api.backend.deleteScan("scn_4kd2p9")).resolves.toBeUndefined();
    expect(requests(api.seen)).toEqual(["DELETE /scans/scn_4kd2p9"]);
  });
});

describe("ideas", () => {
  test("getIdeas posts the theme, language and ideas shown, and resolves with the set's items", async () => {
    const api = fakeApi(() => json(IDEA_SET));
    const ideas = await api.backend.getIdeas("scn_4kd2p9", "vehicles", "id", {
      exclude: IDEAS_REQUEST.exclude,
    });
    expect(ideas).toEqual(IDEA_SET.items);
    const [post] = api.seen;
    expect(requests(api.seen)).toEqual(["POST /scans/scn_4kd2p9/ideas"]);
    expect(headers(post)["Content-Type"]).toBe("application/json");
    expect(JSON.parse(post.init.body as string)).toEqual(IDEAS_REQUEST);
  });

  test("exclude is left out when empty, and holds the newest 50 at most", async () => {
    const api = fakeApi(() => json(IDEA_SET));
    await api.backend.getIdeas("scn_4kd2p9", "animals", "en", {});
    const shown = Array.from({ length: 60 }, (_, index) => `idea_${index}`);
    await api.backend.getIdeas("scn_4kd2p9", "animals", "en", {
      exclude: shown,
    });
    const bodies = api.seen.map(({ init }) => JSON.parse(init.body as string));
    expect(bodies[0]).toEqual({ theme: "animals", locale: "en" });
    expect(bodies[1].exclude).toEqual(shown.slice(10));
  });

  // The contract's errors for ideas, and what the data layer turns each into.
  test.each([
    ["409 no_pieces", () => error("no_pieces", 409), "no_pieces"],
    ["503 unavailable", () => error("unavailable", 503), "network"],
    ["500 internal", () => error("internal", 500), "network"],
    [
      "a 502 with no JSON",
      () => new Response("Bad gateway", { status: 502 }),
      "network",
    ],
    ["a 200 that isn't an idea set", () => json({ ideas: [] }), "network"],
    ["no answer", offline, "network"],
  ] as const)("getIdeas rejects %s with the reason %s", async (_, answer, reason) => {
    const api = fakeApi(answer);
    await expect(
      api.backend.getIdeas("scn_4kd2p9", "vehicles", "en", {}),
    ).rejects.toEqual(new ApiError(reason));
  });

  test("getIdeas rejects 504 timeout with the reason the contract gives", async () => {
    const reason = (SCAN_FAILURES as readonly string[]).includes("timeout")
      ? "timeout"
      : "network";
    const api = fakeApi(() => error("timeout", 504));
    await expect(
      api.backend.getIdeas("scn_4kd2p9", "vehicles", "en", {}),
    ).rejects.toEqual(new ApiError(reason as "network"));
  });

  test("getIdeas rejects a gone scan with a NotFoundError", async () => {
    const api = fakeApi(() => json(SCAN_NOT_FOUND, 404));
    await expect(
      api.backend.getIdeas("scn_4kd2p9", "vehicles", "en", {}),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  test("getIdeas gives up after 40 s with no answer, aborting the request", async () => {
    vi.useFakeTimers();
    try {
      const api = fakeApi(silent);
      const ideas = outcome(
        api.backend.getIdeas("scn_4kd2p9", "vehicles", "en", {}),
      );
      await vi.advanceTimersByTimeAsync(LIMITS.ideasMs - 1);
      expect(api.seen[0].init.signal?.aborted).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      expect(await ideas).toEqual({ reason: new ApiError("network") });
      expect(api.seen[0].init.signal?.aborted).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  test("getIdea reads one idea with its set, and turns 404 not_found into null", async () => {
    const api = fakeApi(
      inTurn(
        () => json(STORED_IDEA),
        () => json(SCAN_NOT_FOUND, 404),
      ),
    );
    expect(await api.backend.getIdea("scn_4kd2p9", "idea_r4c8")).toEqual(
      STORED_IDEA,
    );
    expect(await api.backend.getIdea("scn_4kd2p9", "idea_r4c8")).toBeNull();
    expect(requests(api.seen)[0]).toBe("GET /scans/scn_4kd2p9/ideas/idea_r4c8");
  });
});

test("the base URL may end in a slash, and ids are sent as path segments", async () => {
  const seen: string[] = [];
  const backend = httpBackend(`${BASE_URL}/`, {
    fetch: (async (input: RequestInfo | URL) => {
      seen.push(String(input));
      return json(SCAN_NOT_FOUND, 404);
    }) as typeof fetch,
    token: () => TOKEN,
  });
  await backend.getScan("scn 1/2");
  expect(seen).toEqual([`${BASE_URL}/scans/scn%201%2F2`]);
});

describe("picture builds", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const RUNNING = { ...PICTURE_JOB_ACCEPTED, stage: "designing" };

  /** Polls answer with `polls` in turn, after the upload's 202. */
  function building(...polls: Answer[]) {
    const api = fakeApi((request) =>
      request.method === "POST"
        ? json(PICTURE_JOB_ACCEPTED, 202)
        : request.method === "DELETE"
          ? noContent()
          : polled(request),
    );
    const polled = inTurn(...polls);
    const stages: PictureStage[] = [];
    const controller = new AbortController();
    const result = outcome(
      api.backend.createPictureBuild(PHOTO, "id", {
        onStage: (stage) => stages.push(stage),
        signal: controller.signal,
      }),
    );
    return { ...api, stages, controller, result };
  }

  test("the quota is read with the session", async () => {
    const api = fakeApi(() => json(PICTURE_QUOTA));
    expect(await api.backend.getPictureQuota()).toEqual(PICTURE_QUOTA);
    expect(requests(api.seen)).toEqual(["GET /picture-quota"]);
    expect(headers(api.seen[0]).Authorization).toBe(`Bearer ${TOKEN}`);
  });

  test("uploads the picture and its language as a job, polls it every second and resolves with the build", async () => {
    const build = building(
      () => json(RUNNING),
      () => json(PICTURE_JOB_DONE),
    );
    await vi.advanceTimersByTimeAsync(2 * LIMITS.picturePollMs);
    expect(await build.result).toEqual({ value: PICTURE_BUILD });
    expect(build.stages).toEqual(["queued", "designing"]);
    expect(requests(build.seen)).toEqual([
      "POST /picture-jobs",
      "GET /picture-jobs/pjob_Q3v8tL2x",
      "GET /picture-jobs/pjob_Q3v8tL2x",
    ]);
    const form = build.seen[0].init.body as FormData;
    expect((form.get("picture") as File).name).toBe("photo.jpg");
    expect(form.get("locale")).toBe("id");
  });

  test.each([
    "picture_unusable",
    "picture_refused",
    "no_valid_build",
    "picture_budget",
    "timeout",
    "unavailable",
  ])("a job that failed with %s rejects with that reason, and isn't cancelled", async (code) => {
    const build = building(() =>
      json({ ...PICTURE_JOB_FAILED, error: { code, message: "Failed." } }),
    );
    await vi.advanceTimersByTimeAsync(LIMITS.picturePollMs);
    expect(await build.result).toEqual({
      reason: new PictureError(code as "timeout"),
    });
    expect(requests(build.seen)).not.toContain(
      "DELETE /picture-jobs/pjob_Q3v8tL2x",
    );
  });

  test("a job that failed with internal is network", async () => {
    const build = building(() =>
      json({ ...PICTURE_JOB_FAILED, error: { code: "internal", message: "" } }),
    );
    await vi.advanceTimersByTimeAsync(LIMITS.picturePollMs);
    expect(await build.result).toEqual({ reason: new PictureError("network") });
  });

  test.each([
    ["picture_limit", 429],
    ["picture_budget", 503],
    ["unavailable", 503],
  ])("an upload refused with %s rejects with that reason", async (code, status) => {
    const api = fakeApi(() => error(code, status));
    await expect(
      api.backend.createPictureBuild(PHOTO, "en", {}),
    ).rejects.toEqual(new PictureError(code as "unavailable"));
  });

  test("aborting stops polling, rejects with an AbortError and deletes the job with keepalive", async () => {
    const build = building(() => json(RUNNING));
    await vi.advanceTimersByTimeAsync(LIMITS.picturePollMs + 100);
    build.controller.abort();
    const { reason } = (await build.result) as { reason: Error };
    expect(reason.name).toBe("AbortError");
    await vi.advanceTimersByTimeAsync(5 * LIMITS.picturePollMs);
    expect(requests(build.seen)).toEqual([
      "POST /picture-jobs",
      "GET /picture-jobs/pjob_Q3v8tL2x",
      "DELETE /picture-jobs/pjob_Q3v8tL2x",
    ]);
    expect(build.seen[2].init.keepalive).toBe(true);
  });

  test("a busy or unanswered poll is retried; three in a row give up as network", async () => {
    const build = building(
      offline,
      () => json(RUNNING),
      () => error("unavailable", 503),
      offline,
      () => new Response("<html>Bad gateway</html>", { status: 502 }),
    );
    await vi.advanceTimersByTimeAsync(5 * LIMITS.picturePollMs);
    expect(await build.result).toEqual({ reason: new PictureError("network") });
    expect(requests(build.seen).at(-1)).toBe(
      "DELETE /picture-jobs/pjob_Q3v8tL2x",
    );
  });

  test("a build with no ending after 10 minutes gives up as network", async () => {
    const build = building(() => json(RUNNING));
    await vi.advanceTimersByTimeAsync(LIMITS.pictureMs);
    expect(await build.result).toEqual({ reason: new PictureError("network") });
    expect(requests(build.seen).at(-1)).toBe(
      "DELETE /picture-jobs/pjob_Q3v8tL2x",
    );
  });

  test("builds are listed, read with a scan's check, and deleted", async () => {
    const api = fakeApi((request) =>
      request.method === "DELETE"
        ? noContent()
        : request.path === "/picture-builds"
          ? json({ builds: [PICTURE_BUILD] })
          : request.path.includes("scanId")
            ? json(PICTURE_BUILD_CHECKED)
            : error("not_found", 404),
    );
    expect(await api.backend.listPictureBuilds()).toEqual([PICTURE_BUILD]);
    expect(
      await api.backend.getPictureBuild(PICTURE_BUILD.id, {
        scanId: "scn_4kd2p9",
      }),
    ).toEqual(PICTURE_BUILD_CHECKED);
    expect(await api.backend.getPictureBuild("pic_gone", {})).toBeNull();
    await api.backend.deletePictureBuild(PICTURE_BUILD.id);
    expect(requests(api.seen)).toEqual([
      "GET /picture-builds",
      "GET /picture-builds/pic_8KfD2mQx1Zr?scanId=scn_4kd2p9",
      "GET /picture-builds/pic_gone",
      "DELETE /picture-builds/pic_8KfD2mQx1Zr",
    ]);
  });

  test("without a session, picture calls reject as unauthorized", async () => {
    const api = fakeApi(() => error("unauthorized", 401));
    await expect(api.backend.getPictureQuota()).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    await expect(api.backend.listPictureBuilds()).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });
});
