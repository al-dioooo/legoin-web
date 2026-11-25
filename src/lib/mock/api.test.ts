import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, expect, test } from "vitest";
import { toInventory } from "@/lib/inventory";
import {
  createScan,
  deleteScan,
  getIdea,
  getIdeas,
  getScan,
  listScans,
  MockApiError,
  mockOptionsFromSearch,
  resetMockData,
  updateDetections,
} from "@/lib/mock/api";
import { BUILD_PREVIEWS } from "@/lib/mock/builds";
import { IDEA_TEMPLATES } from "@/lib/mock/fixtures";
import { EVENING_PHOTO } from "@/lib/sample-scan";

const fast = { delayMs: 0 };
const ids = (ideas: { id: string }[]) => ideas.map((idea) => idea.id);

beforeEach(() => {
  resetMockData();
});

test("new visitors start with the demo scans, newest first", async () => {
  const scans = await listScans(fast);
  expect(scans.map((scan) => scan.id)).toEqual([
    "demo-evening",
    "demo-desk",
    "demo-pile",
    "demo-single",
  ]);
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

test("a photo that isn't a demo gets sample pieces it doesn't mark on the photo", async () => {
  const own = { src: "data:image/jpeg;base64,AAAA", width: 900, height: 1200 };
  const scan = await createScan(own, fast);
  expect(scan.photo).toEqual(own);
  expect(scan.detections).toHaveLength(6);
  for (const detection of scan.detections) {
    expect(detection.box).toBeNull();
    expect(detection.confidence).toBeGreaterThan(0);
  }
});

test("failures reject with their reason and save nothing", async () => {
  await expect(
    createScan(EVENING_PHOTO, { ...fast, fail: "no_pieces" }),
  ).rejects.toEqual(new MockApiError("no_pieces"));
  expect(await listScans(fast)).toHaveLength(4);
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

test("a correction that changes the inventory drops the kept ideas", async () => {
  const {
    items: [raceCar],
  } = await getIdeas("demo-evening", "vehicles", "en", fast);
  const scan = await updateDetections(
    "demo-evening",
    [{ type: "edit", id: "evening-6", part: "plate-2x2" }],
    fast,
  );
  // They were checked against the pieces as they were; the next ask checks these.
  expect(scan.ideas).toBeUndefined();
  expect((await getScan("demo-evening", fast))?.ideas).toBeUndefined();
  expect(await getIdea("demo-evening", raceCar.id, fast)).toBeNull();
  // The picker still starts from the theme used last.
  expect(scan.lastTheme).toBe("vehicles");
});

test("a correction that leaves the inventory as it was keeps the ideas", async () => {
  const { items: ideas } = await getIdeas(
    "demo-evening",
    "animals",
    "en",
    fast,
  );
  const flagged = (await getScan("demo-evening", fast))?.detections.find(
    (d) => d.id === "evening-6",
  );
  // Confirming a flagged piece as it is.
  const scan = await updateDetections(
    "demo-evening",
    [
      {
        type: "edit",
        id: "evening-6",
        part: flagged?.part,
        color: flagged?.color,
      },
    ],
    fast,
  );
  expect(scan.ideas?.items).toEqual(ideas);
  expect((await getIdea("demo-evening", ideas[0].id, fast))?.idea).toEqual(
    ideas[0],
  );
});

test("deleted scans are gone", async () => {
  await deleteScan("demo-desk", fast);
  expect(await getScan("demo-desk", fast)).toBeNull();
});

test("ideas come in the requested language and remember the theme", async () => {
  const { items: ideas } = await getIdeas("demo-desk", "vehicles", "id", fast);
  expect(ideas.map((idea) => idea.title)).toEqual([
    "Mobil balap kecil",
    "Truk pengantar",
    "Perahu kecil",
  ]);
  expect((await getScan("demo-desk", fast))?.lastTheme).toBe("vehicles");
});

test("the latest ideas are kept on the scan with their theme and language", async () => {
  expect((await getScan("demo-desk", fast))?.ideas).toBeUndefined();
  const { items: ideas } = await getIdeas("demo-desk", "surprise", "id", fast);
  expect((await getScan("demo-desk", fast))?.ideas).toEqual({
    theme: "surprise",
    locale: "id",
    items: ideas,
  });
});

test("a kept idea reads back with its set, in the language it was written in", async () => {
  const { items: ideas } = await getIdeas(
    "demo-evening",
    "animals",
    "id",
    fast,
  );
  const stored = await getIdea("demo-evening", ideas[1].id, fast);
  expect(stored?.idea).toEqual(ideas[1]);
  expect(stored?.idea.title).toBe("Kura-kura");
  expect(stored?.set).toMatchObject({ theme: "animals", locale: "id" });
  expect(ids(stored?.set.items ?? [])).toEqual(ids(ideas));
});

test("an unknown scan or idea, or a scan without ideas yet, has no idea", async () => {
  expect(await getIdea("demo-desk", "race-car", fast)).toBeNull();
  await getIdeas("demo-desk", "vehicles", "en", fast);
  expect(await getIdea("demo-desk", "race-car", fast)).not.toBeNull();
  expect(await getIdea("demo-desk", "dragon", fast)).toBeNull();
  expect(await getIdea("nope", "race-car", fast)).toBeNull();
});

test("other ideas replace the kept ones", async () => {
  const { items: first } = await getIdeas(
    "demo-evening",
    "vehicles",
    "en",
    fast,
  );
  const { items: second } = await getIdeas("demo-evening", "vehicles", "en", {
    ...fast,
    exclude: ids(first),
  });
  const kept = (await getScan("demo-evening", fast))?.ideas;
  expect(ids(kept?.items ?? [])).toEqual(ids(second));
  expect(await getIdea("demo-evening", first[0].id, fast)).toBeNull();
  expect((await getIdea("demo-evening", second[0].id, fast))?.idea).toEqual(
    second[0],
  );
});

test("a failed request keeps the ideas from before", async () => {
  const { items: ideas } = await getIdeas("demo-desk", "animals", "en", fast);
  await expect(
    getIdeas("demo-desk", "vehicles", "en", { ...fast, fail: "network" }),
  ).rejects.toEqual(new MockApiError("network"));
  expect((await getScan("demo-desk", fast))?.ideas?.items).toEqual(ideas);
});

test("a scan with no pieces fails with no_pieces and saves nothing", async () => {
  await getIdeas("demo-desk", "animals", "en", fast);
  const scan = await getScan("demo-desk", fast);
  if (!scan) throw new Error("demo scan missing");
  await updateDetections(
    "demo-desk",
    scan.detections.map(({ id }) => ({ type: "remove", id })),
    fast,
  );
  await expect(getIdeas("demo-desk", "vehicles", "en", fast)).rejects.toEqual(
    new MockApiError("no_pieces"),
  );
  // The theme from before stays, and no ideas were written for no pieces.
  const after = await getScan("demo-desk", fast);
  expect(after?.lastTheme).toBe("animals");
  expect(after?.ideas).toBeUndefined();
});

test("every idea is a checked build, with its picture and model", async () => {
  const { items: ideas } = await getIdeas("demo-desk", "surprise", "id", fast);
  for (const idea of ideas) {
    expect(idea.buildId).toBe(idea.id);
    expect(idea.preview).toEqual(BUILD_PREVIEWS[idea.id]);
  }
});

test("every template's build files are in public/, at URLs versioned by their hash", () => {
  for (const { id } of IDEA_TEMPLATES) {
    const preview = BUILD_PREVIEWS[id];
    expect(preview, id).toBeDefined();
    for (const url of [preview.image, preview.model]) {
      const [path, version] = url.split("?v=");
      expect(path).toMatch(
        new RegExp(`^/builds/${id}/(preview\\.webp|model\\.ldr)$`),
      );
      // Vitest runs from the project root, where public/ is.
      const file = readFileSync(join("public", path));
      expect(createHash("sha256").update(file).digest("hex").slice(0, 12)).toBe(
        version,
      );
    }
  }
});

test("surprise mixes one idea from every theme", async () => {
  const { items: ideas } = await getIdeas("demo-desk", "surprise", "en", fast);
  expect(ideas.map((idea) => idea.theme)).toEqual([
    "vehicles",
    "animals",
    "buildings",
  ]);
});

test("trying other ideas shows unseen ones first, then starts over", async () => {
  const { items: first } = await getIdeas(
    "demo-evening",
    "animals",
    "en",
    fast,
  );
  const { items: second } = await getIdeas("demo-evening", "animals", "en", {
    ...fast,
    exclude: ids(first),
  });
  expect(ids(second)).toEqual(["snail", "crab", "puppy"]);
  const { items: third } = await getIdeas("demo-evening", "animals", "en", {
    ...fast,
    exclude: [...ids(first), ...ids(second)],
  });
  expect(ids(third)).toEqual(ids(first));
});

test("surprise moves on to the next idea of every theme", async () => {
  const { items: first } = await getIdeas("demo-desk", "surprise", "en", fast);
  const { items: next } = await getIdeas("demo-desk", "surprise", "en", {
    ...fast,
    exclude: ids(first),
  });
  expect(ids(next)).toEqual(["delivery-truck", "turtle", "lighthouse"]);
});

test("some evening ideas use only the evening pieces", async () => {
  const { items: first } = await getIdeas(
    "demo-evening",
    "vehicles",
    "en",
    fast,
  );
  const {
    items: [goKart],
  } = await getIdeas("demo-evening", "vehicles", "en", {
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
      const { items: first } = await getIdeas(scan.id, theme, "en", fast);
      const { items: second } = await getIdeas(scan.id, theme, "en", {
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
  expect(mockOptionsFromSearch("?mockBuilds=1500")).toEqual({
    builds: 1500,
  });
  expect(mockOptionsFromSearch("?mockBuilds=soon")).toEqual({});
});

test("with builds, ideas answer as building and join the set one by one", async () => {
  const answer = await getIdeas("demo-evening", "vehicles", "en", {
    ...fast,
    builds: 40,
  });
  expect(answer.items).toEqual([]);
  expect(answer.building).toEqual([
    { id: "race-car", theme: "vehicles" },
    { id: "delivery-truck", theme: "vehicles" },
    { id: "little-boat", theme: "vehicles" },
  ]);
  // Nothing to open while it's building.
  expect(await getIdea("demo-evening", "race-car", fast)).toBeNull();

  await new Promise((done) => setTimeout(done, 55));
  const partway = (await getScan("demo-evening", fast))?.ideas;
  expect(ids(partway?.items ?? [])).toEqual(["race-car", "delivery-truck"]);
  expect(partway?.building).toEqual([{ id: "little-boat", theme: "vehicles" }]);

  await new Promise((done) => setTimeout(done, 30));
  const done = (await getScan("demo-evening", fast))?.ideas;
  expect(ids(done?.items ?? [])).toEqual([
    "race-car",
    "delivery-truck",
    "little-boat",
  ]);
  expect(done).not.toHaveProperty("building");
  expect(done?.items[0].preview).toEqual(BUILD_PREVIEWS["race-car"]);
  expect((await getIdea("demo-evening", "race-car", fast))?.idea.title).toBe(
    "Little race car",
  );
});

test("a replaced set's builds never land on the new one", async () => {
  await getIdeas("demo-evening", "vehicles", "en", { ...fast, builds: 20 });
  await getIdeas("demo-evening", "animals", "en", fast);

  await new Promise((done) => setTimeout(done, 60));
  const kept = (await getScan("demo-evening", fast))?.ideas;
  expect(kept?.theme).toBe("animals");
  expect(kept?.items.every((idea) => idea.theme === "animals")).toBe(true);
});

test("resetting the demo forgets builds on their way", async () => {
  await getIdeas("demo-evening", "vehicles", "en", { ...fast, builds: 0 });
  resetMockData();
  const answer = await getIdeas("demo-evening", "vehicles", "en", fast);
  expect(answer.items).toHaveLength(3);
  expect(answer).not.toHaveProperty("building");
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
  expect(await listScans(fast)).toHaveLength(4);
});

test("every demo box lies inside its photo", async () => {
  for (const scan of await listScans(fast)) {
    for (const { box } of scan.detections) {
      if (!box) continue;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(1);
      expect(box.y + box.height).toBeLessThanOrEqual(1);
    }
  }
});

test("a demo photo gets its own detections", async () => {
  const pile = await getScan("demo-pile", fast);
  if (!pile) throw new Error("no pile demo");
  const scan = await createScan(pile.photo, fast);
  expect(scan.detections).toHaveLength(30);
  expect(scan.detections.map(({ box }) => box)).toEqual(
    pile.detections.map(({ box }) => box),
  );
});
