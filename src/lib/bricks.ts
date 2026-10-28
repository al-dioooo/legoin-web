/* The MVP brick catalogue from the PRD: 10 colors and 13 parts.
 * Hex values live in tokens.css as --brick-<id>; ids match those token names.
 * `rebrickableId` and `designId` let model output and inventories map to Rebrickable and BrickLink.
 * Color names come in every UI language; part names are the hobby's English terms in both.
 */
import { LOCALE_TAGS, type Locale } from "@/i18n/locales";

export const BRICK_COLORS = {
  red: { label: { en: "Red", id: "Merah" }, rebrickableId: 4, tone: "dark" },
  blue: { label: { en: "Blue", id: "Biru" }, rebrickableId: 1, tone: "dark" },
  yellow: {
    label: { en: "Yellow", id: "Kuning" },
    rebrickableId: 14,
    tone: "light",
  },
  green: {
    label: { en: "Green", id: "Hijau" },
    rebrickableId: 2,
    tone: "dark",
  },
  black: {
    label: { en: "Black", id: "Hitam" },
    rebrickableId: 0,
    tone: "dark",
  },
  white: {
    label: { en: "White", id: "Putih" },
    rebrickableId: 15,
    tone: "light",
  },
  "light-gray": {
    label: { en: "Light gray", id: "Abu-abu terang" },
    rebrickableId: 71,
    tone: "light",
  },
  "dark-gray": {
    label: { en: "Dark gray", id: "Abu-abu gelap" },
    rebrickableId: 72,
    tone: "dark",
  },
  orange: {
    label: { en: "Orange", id: "Oranye" },
    rebrickableId: 25,
    tone: "light",
  },
  brown: {
    label: { en: "Brown", id: "Cokelat" },
    rebrickableId: 70,
    tone: "dark",
  },
} as const satisfies Record<
  string,
  {
    label: Record<Locale, string>;
    rebrickableId: number;
    tone: "light" | "dark";
  }
>;

export type BrickColorId = keyof typeof BRICK_COLORS;

export type BrickKind = "brick" | "plate" | "slope" | "tile" | "round";

/** `studs` is [width, length] seen from above. */
export const BRICK_PARTS = {
  "brick-1x1": {
    label: "Brick 1×1",
    kind: "brick",
    studs: [1, 1],
    designId: "3005",
  },
  "brick-1x2": {
    label: "Brick 1×2",
    kind: "brick",
    studs: [1, 2],
    designId: "3004",
  },
  "brick-1x3": {
    label: "Brick 1×3",
    kind: "brick",
    studs: [1, 3],
    designId: "3622",
  },
  "brick-1x4": {
    label: "Brick 1×4",
    kind: "brick",
    studs: [1, 4],
    designId: "3010",
  },
  "brick-2x2": {
    label: "Brick 2×2",
    kind: "brick",
    studs: [2, 2],
    designId: "3003",
  },
  "brick-2x3": {
    label: "Brick 2×3",
    kind: "brick",
    studs: [2, 3],
    designId: "3002",
  },
  "brick-2x4": {
    label: "Brick 2×4",
    kind: "brick",
    studs: [2, 4],
    designId: "3001",
  },
  "plate-1x2": {
    label: "Plate 1×2",
    kind: "plate",
    studs: [1, 2],
    designId: "3023",
  },
  "plate-2x2": {
    label: "Plate 2×2",
    kind: "plate",
    studs: [2, 2],
    designId: "3022",
  },
  "plate-2x4": {
    label: "Plate 2×4",
    kind: "plate",
    studs: [2, 4],
    designId: "3020",
  },
  "slope-2x2": {
    label: "Slope 45° 2×2",
    kind: "slope",
    studs: [2, 2],
    designId: "3039",
  },
  "tile-1x2": {
    label: "Tile 1×2",
    kind: "tile",
    studs: [1, 2],
    designId: "3069b",
  },
  "round-1x1": {
    label: "Round 1×1",
    kind: "round",
    studs: [1, 1],
    designId: "3062b",
  },
} as const satisfies Record<
  string,
  {
    label: string;
    kind: BrickKind;
    studs: readonly [number, number];
    designId: string;
  }
>;

export type BrickPartId = keyof typeof BRICK_PARTS;

/** One inventory or recommendation line: how many of a part in a color. */
export type PartCount = {
  part: BrickPartId;
  color: BrickColorId;
  quantity: number;
};

export function brickColorVar(color: BrickColorId) {
  return `var(--brick-${color})`;
}

export function colorLabel(color: BrickColorId, locale: Locale) {
  return BRICK_COLORS[color].label[locale];
}

/** One line as screen readers hear it: "2× Brick 2×4 red". */
export function describePart(
  { part, color, quantity }: PartCount,
  locale: Locale,
) {
  return `${quantity}× ${BRICK_PARTS[part].label} ${colorLabel(color, locale).toLowerCase()}`;
}

/** Compact name for tight spots like detection labels: "2×4", "plate 1×2". */
export function shortPartLabel(part: BrickPartId) {
  const { kind, studs } = BRICK_PARTS[part];
  const size = studs.join("×");
  return kind === "brick" ? size : `${kind} ${size}`;
}

/** Detector confidence in the reader's number format: 0.94 in English, 0,94 in Indonesian. */
export function formatConfidence(confidence: number, locale: Locale) {
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(confidence);
}

/** Confidence as a whole percentage for spoken names: "94%". */
export function formatPercent(confidence: number, locale: Locale) {
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(confidence);
}
