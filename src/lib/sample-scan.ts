/* A sample scan for the home page and /desain until the CV pipeline exists.
 * The photo was generated with Codex image generation, not taken from a real scan;
 * replace it with a real one once the pipeline returns results.
 * Words (alt text, the idea's title and steps) live in the dictionaries.
 */
import type { Box } from "@/components/ui/detection-box";
import type { Locale } from "@/i18n/locales";
import {
  type BrickColorId,
  type BrickPartId,
  formatConfidence,
  type PartCount,
  shortPartLabel,
} from "@/lib/bricks";

export const SAMPLE_PHOTO = {
  src: "/contoh/kepingan.jpg",
  width: 1200,
  height: 800,
};

/** Detector output for the sample photo, boxes in fractions of the photo. */
export const SAMPLE_DETECTIONS: {
  part: BrickPartId;
  color: BrickColorId;
  box: Box;
  confidence: number;
}[] = [
  {
    part: "brick-2x4",
    color: "red",
    box: { x: 0.075, y: 0.165, width: 0.278, height: 0.245 },
    confidence: 0.94,
  },
  {
    part: "brick-2x2",
    color: "yellow",
    box: { x: 0.44, y: 0.17, width: 0.128, height: 0.24 },
    confidence: 0.91,
  },
  {
    part: "brick-1x4",
    color: "white",
    box: { x: 0.675, y: 0.23, width: 0.262, height: 0.155 },
    confidence: 0.89,
  },
  {
    part: "plate-1x2",
    color: "blue",
    box: { x: 0.104, y: 0.635, width: 0.155, height: 0.14 },
    confidence: 0.86,
  },
  {
    part: "slope-2x2",
    color: "green",
    box: { x: 0.405, y: 0.54, width: 0.18, height: 0.235 },
    confidence: 0.82,
  },
  {
    part: "brick-2x2",
    color: "black",
    box: { x: 0.727, y: 0.54, width: 0.172, height: 0.262 },
    confidence: 0.93,
  },
];

/** The detection shown as selected in the sample. */
export const SAMPLE_SELECTED = 0;

/**
 * Boxes with labels for `DetectedPhoto`. Only the selected box shows its
 * confidence, so labels don't collide on a phone-width photo.
 */
export function sampleBoxes(locale: Locale) {
  return SAMPLE_DETECTIONS.map(({ part, box, confidence }, index) => ({
    box,
    label:
      index === SAMPLE_SELECTED
        ? `${shortPartLabel(part)} · ${formatConfidence(confidence, locale)}`
        : shortPartLabel(part),
  }));
}

export const SAMPLE_INVENTORY: PartCount[] = SAMPLE_DETECTIONS.map(
  ({ part, color }) => ({ part, color, quantity: 1 }),
);

/** Parts for the one idea the AI agent would return for the sample inventory. */
export const SAMPLE_IDEA = {
  used: [
    { part: "brick-2x4", color: "red", quantity: 1 },
    { part: "slope-2x2", color: "green", quantity: 1 },
    { part: "brick-2x2", color: "black", quantity: 1 },
  ] satisfies PartCount[],
  missing: [
    { part: "plate-2x4", color: "black", quantity: 1 },
    { part: "round-1x1", color: "yellow", quantity: 2 },
  ] satisfies PartCount[],
};

export const SAMPLE_MISSING_COUNT = SAMPLE_IDEA.missing.reduce(
  (total, item) => total + item.quantity,
  0,
);
