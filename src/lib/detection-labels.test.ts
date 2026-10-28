// @vitest-environment node
import { expect, test } from "vitest";
import { labeledBoxes } from "@/lib/detection-labels";

const box = { x: 0.1, y: 0.1, width: 0.2, height: 0.2 };

test("only the selected piece shows its confidence, in the reader's format", () => {
  const detections = [
    { id: "a", part: "brick-2x4", box, confidence: 0.94 },
    { id: "b", part: "plate-1x2", box, confidence: 0.86 },
  ] as const;
  expect(labeledBoxes([...detections], "id", "a")).toEqual([
    { box, label: "2×4 · 0,94", selected: true },
    { box, label: "plate 1×2", selected: false },
  ]);
});

test("pieces added by hand have no box and are skipped", () => {
  expect(
    labeledBoxes(
      [{ id: "added", part: "round-1x1", box: null, confidence: null }],
      "en",
      "added",
    ),
  ).toEqual([]);
});
