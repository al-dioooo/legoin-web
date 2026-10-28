// @vitest-environment node
import { expect, test } from "vitest";
import type { Detection } from "@/lib/domain";
import { applyChanges, checkInventory, toInventory } from "@/lib/inventory";

const box = { x: 0, y: 0, width: 0.1, height: 0.1 };
const detections: Detection[] = [
  { id: "a", part: "brick-2x4", color: "red", box, confidence: 0.9 },
  { id: "b", part: "brick-2x4", color: "red", box, confidence: 0.8 },
  { id: "c", part: "brick-2x2", color: "black", box, confidence: 0.58 },
  { id: "d", part: "tile-1x2", color: "light-gray", box, confidence: 0.7 },
];

test("groups detections by part and color, biggest group first", () => {
  expect(toInventory(detections)).toEqual([
    { part: "brick-2x4", color: "red", quantity: 2 },
    { part: "brick-2x2", color: "black", quantity: 1 },
    { part: "tile-1x2", color: "light-gray", quantity: 1 },
  ]);
});

test("editing a piece moves it to its new group", () => {
  const edited = applyChanges(
    detections,
    [{ type: "edit", id: "c", part: "plate-2x2", color: "dark-gray" }],
    () => "new",
  );
  expect(edited.find((d) => d.id === "c")).toMatchObject({
    part: "plate-2x2",
    color: "dark-gray",
    edited: true,
  });
  expect(toInventory(edited)).toContainEqual({
    part: "plate-2x2",
    color: "dark-gray",
    quantity: 1,
  });
  expect(toInventory(edited)).not.toContainEqual(
    expect.objectContaining({ part: "brick-2x2" }),
  );
});

test("removing and adding pieces updates the counts", () => {
  let ids = 0;
  const changed = applyChanges(
    detections,
    [
      { type: "remove", id: "a" },
      { type: "add", part: "round-1x1", color: "yellow", quantity: 2 },
    ],
    () => `added-${++ids}`,
  );
  const added = changed.filter((d) => d.id.startsWith("added-"));
  expect(added).toHaveLength(2);
  expect(added.every((d) => d.box === null && d.confidence === null)).toBe(
    true,
  );
  expect(toInventory(changed)).toEqual([
    { part: "round-1x1", color: "yellow", quantity: 2 },
    { part: "brick-2x2", color: "black", quantity: 1 },
    { part: "brick-2x4", color: "red", quantity: 1 },
    { part: "tile-1x2", color: "light-gray", quantity: 1 },
  ]);
});

test("checkInventory never counts a missing part as owned", () => {
  const { used, missing } = checkInventory(
    [
      { part: "brick-2x4", color: "red", quantity: 3 },
      { part: "round-1x1", color: "yellow", quantity: 2 },
      { part: "brick-2x4", color: "red", quantity: 1 },
    ],
    toInventory(detections),
  );
  expect(used).toEqual([{ part: "brick-2x4", color: "red", quantity: 2 }]);
  expect(missing).toEqual([
    { part: "brick-2x4", color: "red", quantity: 2 },
    { part: "round-1x1", color: "yellow", quantity: 2 },
  ]);
});
