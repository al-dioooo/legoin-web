// @vitest-environment node
import { expect, test } from "vitest";
import { labeledBoxes } from "@/lib/detection-labels";

const box = { x: 0.1, y: 0.1, width: 0.2, height: 0.2 };

test("only the selected piece shows its confidence, in the reader's format", () => {
  const boxes = labeledBoxes(
    [
      { id: "a", part: "brick-2x4", color: "red", box, confidence: 0.94 },
      { id: "b", part: "plate-1x2", color: "blue", box, confidence: 0.86 },
    ],
    "id",
    "a",
  );
  expect(boxes.map(({ label, selected }) => ({ label, selected }))).toEqual([
    { label: "2×4 · 0,94", selected: true },
    { label: "plate 1×2", selected: false },
  ]);
});

test("each box has a spoken name with part, color and confidence", () => {
  const [brick] = labeledBoxes(
    [{ id: "a", part: "brick-2x4", color: "red", box, confidence: 0.94 }],
    "en",
  );
  expect(brick.name).toBe("Brick 2×4, red, 94%");
});

test("pieces below 0.6 confidence are flagged for checking", () => {
  const boxes = labeledBoxes(
    [
      {
        id: "low",
        part: "brick-2x2",
        color: "dark-gray",
        box,
        confidence: 0.58,
      },
      { id: "ok", part: "brick-2x2", color: "black", box, confidence: 0.6 },
    ],
    "en",
  );
  expect(boxes.map((b) => b.flagged)).toEqual([true, false]);
});

test("pieces added by hand have no box and are skipped", () => {
  expect(
    labeledBoxes(
      [
        {
          id: "added",
          part: "round-1x1",
          color: "yellow",
          box: null,
          confidence: null,
        },
      ],
      "en",
      "added",
    ),
  ).toEqual([]);
});
