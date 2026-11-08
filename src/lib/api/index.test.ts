import { beforeEach, expect, test } from "vitest";
import { ApiError, createScan, getIdeas, getScan } from "@/lib/api";
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
