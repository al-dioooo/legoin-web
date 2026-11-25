import { beforeEach, expect, test, vi } from "vitest";
import {
  ApiError,
  AuthError,
  createScan,
  currentAccount,
  getAccount,
  getIdea,
  getIdeas,
  getScan,
  logIn,
  logOut,
  NotFoundError,
  register,
  subscribeToAccount,
  updateDetections,
} from "@/lib/api";
import { saveSession } from "@/lib/api/session";
import { SCAN_STAGES, type ScanStage } from "@/lib/domain";
import { EVENING_PHOTO } from "@/lib/sample-scan";

/** Demo options come from the page's URL, as they do in the browser. */
const visit = (search: string) =>
  window.history.replaceState(null, "", `/en/scan?${search}`);

beforeEach(() => {
  // The mock keeps scans in localStorage; empty, it starts from the demo scans.
  localStorage.clear();
  visit("");
});

test("a scan reports every stage once and is saved", async () => {
  visit("mockDelay=0");
  const stages: ScanStage[] = [];
  const scan = await createScan(EVENING_PHOTO, {
    onStage: (stage) => stages.push(stage),
  });
  expect(stages).toEqual(SCAN_STAGES);
  expect((await getScan(scan.id))?.photo).toEqual(EVENING_PHOTO);
});

test("?mock=fail-<reason> fails a scan with an ApiError", async () => {
  visit("mock=fail-too_dark&mockDelay=0");
  const error = await createScan(EVENING_PHOTO).catch((caught) => caught);
  expect(error).toBeInstanceOf(ApiError);
  expect(error.reason).toBe("too_dark");
});

test("?mock=fail-<reason> fails ideas, but not reading the scan", async () => {
  visit("mock=fail-network&mockDelay=0");
  const error = await getIdeas("demo-evening", "animals", "en").catch(
    (caught) => caught,
  );
  expect(error).toBeInstanceOf(ApiError);
  expect(error.reason).toBe("network");
  expect((await getScan("demo-evening"))?.id).toBe("demo-evening");
});

test("ideas skip the ones already shown", async () => {
  visit("mockDelay=0");
  const first = await getIdeas("demo-evening", "vehicles", "en");
  const next = await getIdeas("demo-evening", "vehicles", "en", {
    exclude: first.map((idea) => idea.id),
  });
  expect(next).toHaveLength(3);
  for (const idea of next) {
    expect(first.map(({ id }) => id)).not.toContain(idea.id);
  }
});

test("an idea reads back with its set, as written, even in a failure demo", async () => {
  visit("mockDelay=0");
  const ideas = await getIdeas("demo-evening", "animals", "en");
  // Reading stored ideas is quick and never fails on demand, like reading a scan.
  visit("mock=fail-network");
  expect(await getIdea("demo-evening", ideas[2].id)).toEqual({
    idea: ideas[2],
    set: { theme: "animals", locale: "en", items: ideas },
  });
  expect(await getIdea("demo-evening", "dragon")).toBeNull();
  expect(await getIdea("nope", ideas[2].id)).toBeNull();
});

test("ideas skipped with exclude stay out of the kept set", async () => {
  visit("mockDelay=0");
  const first = await getIdeas("demo-desk", "buildings", "id");
  const next = await getIdeas("demo-desk", "buildings", "id", {
    exclude: first.map((idea) => idea.id),
  });
  expect((await getScan("demo-desk"))?.ideas?.items).toEqual(next);
  expect(await getIdea("demo-desk", first[0].id)).toBeNull();
});

test("a scan that's gone is null to read, and a NotFoundError to change", async () => {
  visit("mockDelay=0");
  expect(await getScan("gone")).toBeNull();
  await expect(
    updateDetections("gone", [{ type: "remove", id: "piece" }]),
  ).rejects.toBeInstanceOf(NotFoundError);
  await expect(getIdeas("gone", "animals", "en")).rejects.toBeInstanceOf(
    NotFoundError,
  );
});

test("making an account keeps the session, and lets the old device id go", async () => {
  localStorage.setItem("legoin.deviceId.v1", "kept-from-before-accounts");
  const heard = vi.fn();
  const stop = subscribeToAccount(heard);
  const account = await register("Ana@Example.com", "baseplate-2x4");
  stop();
  expect(account.email).toBe("ana@example.com");
  expect(currentAccount()).toEqual(account);
  expect(currentAccount()).toBe(currentAccount());
  expect(await getAccount()).toEqual(account);
  expect(heard).toHaveBeenCalledOnce();
  expect(localStorage.getItem("legoin.deviceId.v1")).toBeNull();
});

test("logging out forgets the session; logging in again brings the account back", async () => {
  const account = await register("ana@example.com", "baseplate-2x4");
  await logOut();
  expect(currentAccount()).toBeNull();
  expect(await getAccount()).toBeNull();
  await expect(logIn("ana@example.com", "wrong-password")).rejects.toEqual(
    new AuthError("invalid_credentials"),
  );
  expect(await logIn("ana@example.com", "baseplate-2x4")).toEqual(account);
  expect(currentAccount()).toEqual(account);
});

test("a kept session the backend doesn't know is forgotten", async () => {
  saveSession({
    token: "ended-elsewhere",
    expiresAt: "2999-01-01T00:00:00.000Z",
    account: {
      id: "acc_1",
      email: "a@b.co",
      createdAt: "2026-11-25T00:00:00.000Z",
    },
  });
  expect(currentAccount()?.id).toBe("acc_1");
  expect(await getAccount()).toBeNull();
  expect(currentAccount()).toBeNull();
});
