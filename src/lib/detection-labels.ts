import type { Locale } from "@/i18n/locales";
import { formatConfidence, shortPartLabel } from "@/lib/bricks";
import type { Box, Detection } from "@/lib/domain";

export type LabeledBox = { box: Box; label: string; selected: boolean };

/**
 * Boxes with labels for `DetectedPhoto`. Pieces added by hand have no box and
 * are skipped. Only the selected piece shows its confidence, so labels don't
 * collide on a phone-width photo.
 */
export function labeledBoxes(
  detections: Pick<Detection, "id" | "part" | "box" | "confidence">[],
  locale: Locale,
  selectedId?: string,
): LabeledBox[] {
  return detections.flatMap(({ id, part, box, confidence }) => {
    if (!box) return [];
    const selected = id === selectedId;
    const label =
      selected && confidence !== null
        ? `${shortPartLabel(part)} · ${formatConfidence(confidence, locale)}`
        : shortPartLabel(part);
    return [{ box, label, selected }];
  });
}
