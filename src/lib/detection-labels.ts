import type { Locale } from "@/i18n/locales";
import {
  BRICK_PARTS,
  colorLabel,
  formatConfidence,
  formatPercent,
  shortPartLabel,
} from "@/lib/bricks";
import { type Box, type Detection, needsCheck } from "@/lib/domain";

export type LabeledBox = {
  id: string;
  box: Box;
  /** Short text drawn on the photo: "2×4", "plate 1×2 · 0.86". */
  label: string;
  /** What screen readers hear: "Brick 2×4, red, 94%". */
  name: string;
  selected: boolean;
  /** Low confidence and not corrected yet: drawn dashed and called out for checking. */
  flagged: boolean;
  /** Set by `fitLabels` once the photo is measured. Until then, above and to the left. */
  placement?: LabelPlacement;
};

/**
 * Where a label sits on its box so the photo's frame doesn't cut it off.
 * `side` is above the box. When the box touches the photo's top edge, the
 * label goes just inside the box's top if the box is big enough to hold it
 * and still show its piece, and just below the box otherwise. `align` lines
 * the label up with the box's left side, or with its right side when the box
 * is near the photo's right edge.
 */
export type LabelPlacement = {
  side: "above" | "inside" | "below";
  align: "left" | "right";
};

/**
 * Pieces the pipeline reported without a place on the photo. The detector boxes
 * everything it finds, so only the mock does this: for a photo it has no
 * detections for, it returns sample pieces it can't place. Pieces added by hand
 * have no box either, but no confidence, and don't count.
 */
export function countUnplaced(
  detections: Pick<Detection, "box" | "confidence">[],
) {
  return detections.filter(
    ({ box, confidence }) => box === null && confidence !== null,
  ).length;
}

/**
 * Boxes with labels for `DetectedPhoto`. Pieces added by hand have no box and
 * are skipped. Only the selected piece shows its confidence on the photo, so
 * labels stay short.
 */
export function labeledBoxes(
  detections: Pick<
    Detection,
    "id" | "part" | "color" | "box" | "confidence" | "edited"
  >[],
  locale: Locale,
  selectedId?: string,
): LabeledBox[] {
  return detections.flatMap(({ id, part, color, box, confidence, edited }) => {
    if (!box) return [];
    const selected = id === selectedId;
    const label =
      selected && confidence !== null
        ? `${shortPartLabel(part)} · ${formatConfidence(confidence, locale)}`
        : shortPartLabel(part);
    const name = [
      BRICK_PARTS[part].label,
      colorLabel(color, locale).toLowerCase(),
      confidence === null ? null : formatPercent(confidence, locale),
    ]
      .filter(Boolean)
      .join(", ");
    const flagged = needsCheck({ confidence, edited });
    return [{ id, box, label, name, selected, flagged }];
  });
}

/** A photo as drawn on screen, in CSS pixels. */
export type DrawnSize = { width: number; height: number };

// A label as `DetectionBox` draws it: 12px mono text (about 7.2px a character)
// with 6px padding each side, 20px tall. Above or below its box it sits 4px
// away and 2px out to the side, in line with the box's outline. Inside, it sits
// in the corner within the box's 2–3px border.
const LABEL_CHAR = 7.2;
const LABEL_PADDING = 12;
const LABEL_HEIGHT = 20;
const LABEL_GAP = 4;
const LABEL_OUTSET = 2;
const LABEL_INSET = 3;
// The selected box lifts 6px (`--lift-y`) and tilts 1.5°, which raises the far
// end of a long label about 2px more.
const SELECTED_LIFT = 8;

type Rect = { left: number; top: number; right: number; bottom: number };

const intersects = (a: Rect, b: Rect) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/**
 * Above the box when there's room. Otherwise inside its top, if the label fits
 * there and covers at most half the piece, or else below the box.
 */
function labelSide(
  own: Rect,
  width: number,
  size: DrawnSize,
): LabelPlacement["side"] {
  if (own.top - LABEL_GAP - LABEL_HEIGHT >= 0) return "above";
  const roomy =
    own.right - own.left >= width + 2 * LABEL_INSET &&
    own.bottom - own.top >= 2 * (LABEL_HEIGHT + LABEL_INSET);
  const roomBelow = own.bottom + LABEL_GAP + LABEL_HEIGHT <= size.height;
  return roomy || !roomBelow ? "inside" : "below";
}

/**
 * Where a box's label goes so the photo's frame doesn't cut it off (see
 * `LabelPlacement`), and the space it takes there. When neither the box's left
 * side nor its right side has room, the label lines up with the side that cuts
 * off less, and `cut` says how many pixels are lost.
 */
function placeLabel(label: string, own: Rect, size: DrawnSize) {
  const width = label.length * LABEL_CHAR + LABEL_PADDING;
  const side = labelSide(own, width, size);
  const top = {
    above: own.top - LABEL_GAP - LABEL_HEIGHT,
    inside: own.top + LABEL_INSET,
    below: own.bottom + LABEL_GAP,
  }[side];
  // Positive reaches out past the box, in line with its outline; negative tucks in.
  const outset = side === "inside" ? -LABEL_INSET : LABEL_OUTSET;
  const fromLeft = own.left - outset;
  const fromRight = own.right + outset;
  const pastRight = Math.max(0, fromLeft + width - size.width);
  const pastLeft = Math.max(0, width - fromRight);
  const align = pastLeft < pastRight ? "right" : "left";
  const left = align === "left" ? fromLeft : fromRight - width;
  return {
    placement: { side, align } satisfies LabelPlacement,
    tag: { left, right: left + width, top, bottom: top + LABEL_HEIGHT },
    cut: Math.min(pastLeft, pastRight),
  };
}

/**
 * Places each label inside the photo's frame (see `LabelPlacement`) on a photo
 * drawn at `size`. Then, so busy photos stay readable, it drops the labels
 * that would cover another label or another piece's box, or that the photo is
 * too narrow to hold. The selected piece always keeps its label. Flagged
 * pieces come next, then the biggest. A piece without a label still has its
 * box and its name for screen readers.
 */
export function fitLabels(boxes: LabeledBox[], size: DrawnSize): LabeledBox[] {
  const rects = boxes.map(({ box }) => ({
    left: box.x * size.width,
    top: box.y * size.height,
    right: (box.x + box.width) * size.width,
    bottom: (box.y + box.height) * size.height,
  }));
  const area = (index: number) =>
    boxes[index].box.width * boxes[index].box.height;
  const rank = (index: number) =>
    boxes[index].selected ? 0 : boxes[index].flagged ? 1 : 2;
  const order = boxes
    .map((_, index) => index)
    .sort((a, b) => rank(a) - rank(b) || area(b) - area(a));

  const placed: Rect[] = [];
  const placements = new Map<number, LabelPlacement>();
  for (const index of order) {
    const { label, selected } = boxes[index];
    const lift = selected ? SELECTED_LIFT : 0;
    const own = rects[index];
    const { placement, tag, cut } = placeLabel(
      label,
      { ...own, top: own.top - lift, bottom: own.bottom - lift },
      size,
    );
    const blocked =
      cut > 0 ||
      placed.some((other) => intersects(tag, other)) ||
      rects.some((other, at) => at !== index && intersects(tag, other));
    if (selected || !blocked) {
      placements.set(index, placement);
      placed.push(tag);
    }
  }
  return boxes.map((box, index) => {
    const placement = placements.get(index);
    return placement ? { ...box, placement } : { ...box, label: "" };
  });
}

/** The smallest box worth tapping, in CSS pixels (WCAG 2.2 target size). */
export const MIN_TARGET = 24;

/**
 * How far to zoom a photo drawn at `size` so its smallest box is at least
 * `MIN_TARGET` across: twice at least, four times at most.
 */
export function zoomFor(boxes: Pick<LabeledBox, "box">[], size: DrawnSize) {
  const sides = boxes.map(({ box }) =>
    Math.min(box.width * size.width, box.height * size.height),
  );
  const smallest = Math.min(...sides);
  if (!(smallest > 0)) return 2;
  return Math.min(4, Math.max(2, Math.ceil(MIN_TARGET / smallest)));
}
