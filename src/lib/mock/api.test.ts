import { beforeEach, expect, test } from "vitest";
import { toInventory } from "@/lib/inventory";
import {
  createScan,
  deleteScan,
  getIdeas,
  getScan,
  listScans,
  MockApiError,
  mockOptionsFromSearch,
  resetMockData,
  updateDetections,
} from "@/lib/mock/api";
import { EVENING_PHOTO, IDEA_TEMPLATES } from "@/lib/mock/fixtures";

const fast = { delayMs: 0 };
const ids = (ideas: { id: string }[]) => ideas.map((idea) => idea.id);

beforeEach(() => {
  resetMockData();
});

test("new visitors start with the two demo scans, newest first", async () => {
  const scans = await listScans(fast);
  expect(scans.map((scan) => scan.id)).toEqual(["demo-evening", "demo-desk"]);
});

test("a scan reports every stage and is saved", async () => {
  const stages: string[] = [];
  const scan = await createScan(EVENING_PHOTO, {
    ...fast,
    onStage: (stage) => stages.push(stage),
  });
  expect(stages).toEqual(["detecting", "classifying", "coloring"]);
  expect(scan.detections).toHaveLength(8);
  expect((await listScans(fast))[0].id).toBe(scan.id);
  expect(await getScan(scan.id, fast)).toEqual(scan);
});

test("failures reject with their reason and save nothing", async () => {
  await expect(
    createScan(EVENING_PHOTO, { ...fast, fail: "no_pieces" }),
  ).rejects.toEqual(new MockApiError("no_pieces"));
  expect(await listScans(fast)).toHaveLength(2);
});

test("corrections persist", async () => {
  await updateDetections(
    "demo-evening",
    [{ type: "edit", id: "evening-6", part: "plate-2x2" }],
    fast,
  );
  const scan = await getScan("demo-evening", fast);
  expect(scan?.detections.find((d) => d.id === "evening-6")).toMatchObject({
    part: "plate-2x2",
    color: "dark-gray",
    edited: true,
  });
});

test("deleted scans are gone", async () => {
  await deleteScan("demo-desk", fast);
  expect(await getScan("demo-desk", fast)).toBeNull();
});

test("ideas come in the requested language and remember the theme", async () => {
  const ideas = await getIdeas("demo-desk", "vehicles", "id", fast);
  expect(ideas.map((idea) => idea.title)).toEqual([
    "Mobil balap kecil",
    "Truk pengantar",
    "Perahu kecil",
  ]);
  expect((await getScan("demo-desk", fast))?.lastTheme).toBe("vehicles");
});

test("surprise mixes one idea from every theme", async () => {
  const ideas = await getIdeas("demo-desk", "surprise", "en", fast);
  expect(ideas.map((idea) => idea.theme)).toEqual([
    "vehicles",
    "animals",
    "buildings",
  ]);
});

test("trying other ideas shows unseen ones first, then starts over", async () => {
  const first = await getIdeas("demo-evening", "animals", "en", fast);
  const second = await getIdeas("demo-evening", "animals", "en", {
    ...fast,
    exclude: ids(first),
  });
  expect(ids(second)).toEqual(["snail", "crab", "puppy"]);
  const third = await getIdeas("demo-evening", "animals", "en", {
    ...fast,
    exclude: [...ids(first), ...ids(second)],
  });
  expect(ids(third)).toEqual(ids(first));
});

test("surprise moves on to the next idea of every theme", async () => {
  const first = await getIdeas("demo-desk", "surprise", "en", fast);
  const next = await getIdeas("demo-desk", "surprise", "en", {
    ...fast,
    exclude: ids(first),
  });
  expect(ids(next)).toEqual(["delivery-truck", "turtle", "lighthouse"]);
});

test("some evening ideas use only the evening pieces", async () => {
  const first = await getIdeas("demo-evening", "vehicles", "en", fast);
  const [goKart] = await getIdeas("demo-evening", "vehicles", "en", {
    ...fast,
    exclude: ids(first),
  });
  expect(goKart).toMatchObject({ id: "go-kart", missing: [] });
});

test("no idea in any demo counts a missing part as owned", async () => {
  for (const scan of await listScans(fast)) {
    const owned = new Map(
      toInventory(scan.detections).map((line) => [
        `${line.part}|${line.color}`,
        line.quantity,
      ]),
    );
    for (const theme of ["vehicles", "animals", "buildings"] as const) {
      // Two rounds cover all six ideas of a theme.
      const first = await getIdeas(scan.id, theme, "en", fast);
      const second = await getIdeas(scan.id, theme, "en", {
        ...fast,
        exclude: ids(first),
      });
      for (const idea of [...first, ...second]) {
        for (const line of idea.used) {
          expect(line.quantity).toBeLessThanOrEqual(
            owned.get(`${line.part}|${line.color}`) ?? 0,
          );
        }
        const template = IDEA_TEMPLATES.find((t) => t.id === idea.id);
        const needed = template?.requires.reduce((n, l) => n + l.quantity, 0);
        const covered = [...idea.used, ...idea.missing].reduce(
          (n, l) => n + l.quantity,
          0,
        );
        expect(covered).toBe(needed);
      }
    }
  }
});

test("every idea has the same number of steps in both languages", () => {
  for (const template of IDEA_TEMPLATES) {
    expect(template.steps.id).toHaveLength(template.steps.en.length);
  }
});

test("demo query options turn into failures and delays", () => {
  expect(mockOptionsFromSearch("?mock=fail-too_dark&mockDelay=0")).toEqual({
    fail: "too_dark",
    delayMs: 0,
  });
  expect(mockOptionsFromSearch("?mock=fail-everything")).toEqual({});
});

test("a cancelled scan rejects and saves nothing", async () => {
  const controller = new AbortController();
  const scanning = createScan(EVENING_PHOTO, {
    delayMs: 5,
    signal: controller.signal,
    onStage: (stage) => {
      if (stage === "classifying") controller.abort();
    },
  });
  await expect(scanning).rejects.toMatchObject({ name: "AbortError" });
  expect(await listScans(fast)).toHaveLength(2);
});
