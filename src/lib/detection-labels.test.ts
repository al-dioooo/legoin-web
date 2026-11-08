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

/** A photo drawn about 300px wide, as on a 360px phone. */
const phone = { width: 300, height: 200 };
/** A selected round 1×1 at (x, y) on `phone`, in fractions; its label is 127px wide. */
const round = (id: string, x: number, y: number): LabeledBox => ({
  id,
  box: { x, y, width: 0.04, height: 0.08 },
  label: "round 1×1 · 0.55",
  name: id,
  selected: true,
  flagged: false,
});
const placement = (boxes: LabeledBox[]) =>
  boxes.map(({ placement }) => placement);
const placeOne = (box: LabeledBox) => fitLabels([box], phone)[0].placement;

test("labels sit above their box, lined up with its left side", () => {
  expect(placeOne(round("left", 0.2, 0.5))).toEqual({
    side: "above",
    align: "left",
  });
});

test("near the photo's right edge, a label lines up with its box's right side", () => {
  // Lined up left, the label would end at 335px, past the 300px edge.
  // Lined up right, it runs from 97px to 224px.
  expect(placeOne(round("right", 0.7, 0.5))).toEqual({
    side: "above",
    align: "right",
  });
});

test("at the photo's top edge, a big box holds its label just inside its top", () => {
  // 4px from the top leaves no room for a 20px label above. The box is
  // 180 × 60px, so the 127px label covers less than half of it.
  const big = {
    ...round("big", 0.1, 0.02),
    box: { x: 0.1, y: 0.02, width: 0.6, height: 0.3 },
  };
  expect(placeOne(big)).toEqual({ side: "inside", align: "left" });
});

test("at the photo's top edge, a small box's label goes just below it", () => {
  // Inside, the label would hide the 12 × 16px piece, so it goes below.
  expect(placeOne(round("top", 0.2, 0.05))).toEqual({
    side: "below",
    align: "left",
  });
  // In the top right corner, it goes below and lines up right.
  expect(placeOne(round("corner", 0.9, 0))).toEqual({
    side: "below",
    align: "right",
  });
  // On a photo too short for room below, it stays inside after all.
  const strip = { ...round("strip", 0.2, 0.05), selected: false };
  expect(fitLabels([strip], { width: 300, height: 24 })[0].placement).toEqual({
    side: "inside",
    align: "left",
  });
});

test("the selected box's lift leaves room for its label above", () => {
  // 28px from the top holds a label above, until the box lifts 6px and tilts.
  const near = round("near", 0.2, 0.14);
  expect(placeOne({ ...near, selected: false })?.side).toBe("above");
  expect(placeOne(near)?.side).toBe("below");
});

test("labels that move to fit the photo are kept, not dropped", () => {
  const top = at("top", 400, 10);
  const right = at("right", 940, 400, { label: "plate 2×2" });
  const fitted = fitLabels([top, right], photo);
  expect(shown(fitted)).toEqual(["top", "right"]);
  expect(placement(fitted)).toEqual([
    { side: "inside", align: "left" },
    { side: "above", align: "right" },
  ]);
});

test("a label the photo is too narrow to hold goes, unless it's selected", () => {
  // 100px across, the label is cut off whichever side it lines up with.
  const narrow = { width: 100, height: 100 };
  const piece = round("piece", 0.4, 0.5);
  expect(shown(fitLabels([{ ...piece, selected: false }], narrow))).toEqual([]);
  // Selected, it keeps its label on the side that loses less.
  const [kept] = fitLabels([piece], narrow);
  expect(kept.label).toBe(piece.label);
  expect(kept.placement).toEqual({ side: "above", align: "left" });
});

test("a label that moves is checked where it lands", () => {
  // Lined up right, the label reaches back to the left, over the neighbor.
  const edge = {
    ...round("edge", 0.8, 0.5),
    selected: false,
    label: "plate 1×2",
  };
  const neighbor = { ...round("neighbor", 0.62, 0.45), selected: false };
  expect(shown(fitLabels([edge], phone))).toEqual(["edge"]);
  expect(shown(fitLabels([edge, neighbor], phone))).toEqual(["neighbor"]);
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
