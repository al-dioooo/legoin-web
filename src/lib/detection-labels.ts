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
// with 6px padding each side, 20px tall, 4px above its box and 2px to the left.
const LABEL_CHAR = 7.2;
const LABEL_PADDING = 12;
const LABEL_HEIGHT = 20;
const LABEL_GAP = 4;

type Rect = { left: number; top: number; right: number; bottom: number };

const intersects = (a: Rect, b: Rect) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/**
 * Drops the labels that would cover another label or another piece's box on a
 * photo drawn at `size`, so busy photos stay readable. The selected piece
 * always keeps its label; flagged pieces come next, then the biggest. A piece
 * without a label still has its box and its name for screen readers.
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
  const keep = new Set<number>();
  for (const index of order) {
    const { label, selected } = boxes[index];
    const own = rects[index];
    const tag = {
      left: own.left - 2,
      right: own.left - 2 + label.length * LABEL_CHAR + LABEL_PADDING,
      bottom: own.top - LABEL_GAP,
      top: own.top - LABEL_GAP - LABEL_HEIGHT,
    };
    const blocked =
      placed.some((other) => intersects(tag, other)) ||
      rects.some((other, at) => at !== index && intersects(tag, other));
    if (selected || !blocked) {
      keep.add(index);
      placed.push(tag);
    }
  }
  return boxes.map((box, index) =>
    keep.has(index) ? box : { ...box, label: "" },
  );
}
