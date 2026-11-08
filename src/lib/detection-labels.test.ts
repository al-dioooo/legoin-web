// @vitest-environment node
import { expect, test } from "vitest";
import {
  countUnplaced,
  fitLabels,
  type LabeledBox,
  labeledBoxes,
  zoomFor,
} from "@/lib/detection-labels";

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

test("a corrected low-confidence piece is no longer flagged", () => {
  const [corrected] = labeledBoxes(
    [
      {
        id: "fixed",
        part: "plate-2x2",
        color: "dark-gray",
        box,
        confidence: 0.58,
        edited: true,
      },
    ],
    "en",
  );
  expect(corrected.flagged).toBe(false);
});

test("only found pieces without a box count as unplaced", () => {
  expect(
    countUnplaced([
      { box, confidence: 0.9 },
      { box: null, confidence: null },
      { box: null, confidence: 0.8 },
    ]),
  ).toBe(1);
});

/** A labeled box at (x, y) on a 1000 × 1000 px photo, 50 px square. */
const at = (
  id: string,
  x: number,
  y: number,
  extra: Partial<LabeledBox> = {},
): LabeledBox => ({
  id,
  box: { x: x / 1000, y: y / 1000, width: 0.05, height: 0.05 },
  label: "2×4",
  name: id,
  selected: false,
  flagged: false,
  ...extra,
});
const shown = (boxes: LabeledBox[]) =>
  boxes.filter(({ label }) => label).map(({ id }) => id);
const photo = { width: 1000, height: 1000 };

test("labels that fit all stay", () => {
  expect(
    shown(fitLabels([at("a", 100, 100), at("b", 400, 100)], photo)),
  ).toEqual(["a", "b"]);
});

test("a label that would cover another piece's box goes", () => {
  // b sits just above a, where a's label would go; b is bigger, so it wins.
  const a = at("a", 100, 200);
  const b = {
    ...at("b", 90, 150),
    box: { x: 0.09, y: 0.15, width: 0.06, height: 0.045 },
  };
  const fitted = fitLabels([a, b], photo);
  expect(shown(fitted)).toEqual(["b"]);
  // Dropped labels keep their box and name.
  expect(fitted[0]).toMatchObject({ id: "a", name: "a", label: "" });
});

test("a label the photo's edge would cut off goes, unless it's selected", () => {
  const top = at("top", 400, 10);
  const right = at("right", 980, 400);
  expect(shown(fitLabels([top, right], photo))).toEqual([]);
  expect(shown(fitLabels([{ ...top, selected: true }], photo))).toEqual([
    "top",
  ]);
});

test("the selected piece keeps its label, then flagged pieces win", () => {
  // Three narrow pieces in a row, close enough that neighbours' labels overlap.
  const narrow = { width: 0.025, height: 0.05 };
  const row = [
    at("big", 100, 200, {
      box: { x: 0.1, y: 0.2, width: 0.025, height: 0.08 },
    }),
    at("flagged", 130, 200, {
      flagged: true,
      box: { x: 0.13, y: 0.2, ...narrow },
    }),
    at("selected", 160, 200, {
      selected: true,
      label: "2×4 · 0.94",
      box: { x: 0.16, y: 0.2, ...narrow },
    }),
  ];
  // The selected label pushes out its neighbour, which no longer blocks "big".
  expect(shown(fitLabels(row, photo))).toEqual(["big", "selected"]);
  // Without a selection, the flagged piece beats the bigger one.
  expect(shown(fitLabels(row.slice(0, 2), photo))).toEqual(["flagged"]);
});

test("zooming in goes far enough for the smallest box to be tapped", () => {
  const phone = { width: 300, height: 200 };
  // The 8-piece demo's smallest box is 22px wide here: the usual 2×.
  expect(
    zoomFor([{ box: { x: 0, y: 0, width: 0.074, height: 0.15 } }], phone),
  ).toBe(2);
  // A round 1×1 in a 30-piece photo is 9px wide: 3× makes it 28px.
  expect(
    zoomFor([{ box: { x: 0, y: 0, width: 0.031, height: 0.074 } }], phone),
  ).toBe(3);
  // Never more than 4×, and 2× before the photo is measured or with no boxes.
  expect(
    zoomFor([{ box: { x: 0, y: 0, width: 0.001, height: 0.001 } }], phone),
  ).toBe(4);
  expect(
    zoomFor([{ box: { x: 0, y: 0, width: 0.1, height: 0.1 } }], {
      width: 0,
      height: 0,
    }),
  ).toBe(2);
  expect(zoomFor([], phone)).toBe(2);
});
