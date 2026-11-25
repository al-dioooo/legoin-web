import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { createScan, resetMockData } from "@/lib/mock/api";
import {
  createPictureBuild,
  DAILY_LIMIT,
  deletePictureBuild,
  getPictureBuild,
  getPictureQuota,
  listPictureBuilds,
  MockPictureError,
  pictureOptionsFromSearch,
  resetMockPictures,
} from "@/lib/mock/pictures";

const PICTURE = { src: "data:image/jpeg;base64,AAAA", width: 900, height: 600 };
const FAST = { delayMs: 0, account: "acc_a" };

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  resetMockPictures("acc_a");
  resetMockData("acc_a");
});

test("a picture goes through every stage and becomes a saved library build", async () => {
  const stages: string[] = [];

  const build = await createPictureBuild(PICTURE, "id", {
    ...FAST,
    onStage: (stage) => stages.push(stage),
  });

  expect(stages).toEqual(["queued", "designing", "checking", "rendering"]);
  expect(build.locale).toBe("id");
  expect(build.picture).toEqual(PICTURE);
  expect(build.preview.image).toMatch(/^\/builds\/[a-z-]+\/preview\.webp\?v=/);
  expect(build.steps.length).toBeGreaterThan(1);
  expect(await listPictureBuilds(FAST)).toEqual([build]);
  expect(await getPictureBuild(build.id, FAST)).toEqual(build);
  // Another account sees none of it.
  expect(await listPictureBuilds({ ...FAST, account: "acc_b" })).toEqual([]);
});

test("the same picture always gets the same build", async () => {
  const first = await createPictureBuild(PICTURE, "en", FAST);
  const second = await createPictureBuild(PICTURE, "en", FAST);

  expect(second.preview).toEqual(first.preview);
  expect(second.id).not.toBe(first.id);
});

test("an account may start two a day, then the quota says why not", async () => {
  expect(await getPictureQuota(FAST)).toMatchObject({
    available: true,
    used: 0,
    limit: DAILY_LIMIT,
  });
  for (let i = 0; i < DAILY_LIMIT; i++) {
    await createPictureBuild(PICTURE, "en", FAST);
  }

  const quota = await getPictureQuota(FAST);

  expect(quota).toMatchObject({ available: false, reason: "limit", used: 2 });
  expect(quota.resetsAt).toMatch(/T00:00:00\.000Z$/);
  await expect(createPictureBuild(PICTURE, "en", FAST)).rejects.toEqual(
    new MockPictureError("picture_limit"),
  );
});

test("a failure saves nothing, and only the backend's own failures are given back", async () => {
  await expect(
    createPictureBuild(PICTURE, "en", { ...FAST, fail: "picture_unusable" }),
  ).rejects.toEqual(new MockPictureError("picture_unusable"));
  await expect(
    createPictureBuild(PICTURE, "en", { ...FAST, fail: "unavailable" }),
  ).rejects.toEqual(new MockPictureError("unavailable"));

  expect(await listPictureBuilds(FAST)).toEqual([]);
  expect((await getPictureQuota(FAST)).used).toBe(1);
});

test("cancelling while queued doesn't count", async () => {
  vi.useFakeTimers();
  const controller = new AbortController();
  const build = createPictureBuild(PICTURE, "en", {
    ...FAST,
    delayMs: 1000,
    signal: controller.signal,
  }).catch((error: Error) => error);
  controller.abort();
  await vi.advanceTimersByTimeAsync(1000);
  vi.useRealTimers();

  expect(await build).toHaveProperty("name", "AbortError");
  expect((await getPictureQuota(FAST)).used).toBe(0);
});

test("a build is checked against a scan's pieces, and a missing scan leaves the check out", async () => {
  const build = await createPictureBuild(PICTURE, "en", FAST);
  const scan = await createScan(
    { src: "/contoh/kepingan.jpg", width: 1200, height: 800 },
    FAST,
  );

  const checked = await getPictureBuild(build.id, { ...FAST, scanId: scan.id });
  const unknown = await getPictureBuild(build.id, { ...FAST, scanId: "nope" });

  expect(checked?.check?.scanId).toBe(scan.id);
  const counted = [
    ...(checked?.check?.used ?? []),
    ...(checked?.check?.missing ?? []),
  ];
  expect(counted.reduce((sum, line) => sum + line.quantity, 0)).toBe(
    build.parts.reduce((sum, line) => sum + line.quantity, 0),
  );
  expect(unknown?.check).toBeUndefined();
});

test("deleting a build removes it", async () => {
  const build = await createPictureBuild(PICTURE, "en", FAST);

  await deletePictureBuild(build.id, FAST);

  expect(await getPictureBuild(build.id, FAST)).toBeNull();
});

test("demo options take the picture builds' reasons", () => {
  expect(
    pictureOptionsFromSearch("?mock=fail-no_valid_build&mockDelay=0"),
  ).toEqual({
    fail: "no_valid_build",
    delayMs: 0,
  });
  expect(pictureOptionsFromSearch("?mock=fail-too_dark")).toEqual({});
});
