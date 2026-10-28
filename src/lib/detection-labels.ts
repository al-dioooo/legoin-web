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
