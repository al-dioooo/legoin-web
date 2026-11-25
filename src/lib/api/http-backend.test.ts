// @vitest-environment node
/* Contract tests for the HTTP client (ADR-0007): a fake fetch answers with the
 * API contract's own examples, and each test checks one rule of
 * api/contract.md. There's no backend yet, so this is the only check.
 */
import { describe, expect, test, vi } from "vitest";
import {
  BASE_URL,
  CORRECTED_SCAN,
  CORRECTION,
  DEVICE_ID,
  IDEA_SET,
  IDEAS_REQUEST,
  INVALID_REQUEST,
  JOB_DONE,
  SCAN_LIST,
  SCAN_NOT_FOUND,
  STORED_IDEA,
} from "@/lib/api/contract-examples";
import { ApiError, NotFoundError } from "@/lib/api/error";
import { httpBackend, LIMITS } from "@/lib/api/http-backend";
import { SCAN_FAILURES } from "@/lib/domain";

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
    deviceId: () => DEVICE_ID,
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
    expect(headers(api.seen[0])).toEqual({ "Legoin-Device-Id": DEVICE_ID });
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
    deviceId: () => DEVICE_ID,
  });
  await backend.getScan("scn 1/2");
  expect(seen).toEqual([`${BASE_URL}/scans/scn%201%2F2`]);
});
