/* Domain types shared by the screens and the data layer. They follow the API
 * contract, api/contract.md in al-dioooo/legoin-docs
 * (https://github.com/al-dioooo/legoin-docs/blob/main/api/contract.md),
 * so swapping the mock service for the real API needs no screen changes.
 */
import type { Locale } from "@/i18n/locales";
import type { BrickColorId, BrickPartId, PartCount } from "@/lib/bricks";

/** A box in fractions of the photo (0 to 1), so it scales with the image. */
export type Box = { x: number; y: number; width: number; height: number };

export type Photo = { src: string; width: number; height: number };

/** One piece the pipeline found, or one the person added by hand. */
export type Detection = {
  id: string;
  part: BrickPartId;
  color: BrickColorId;
  /** Where it is on the photo; null for pieces added by hand. */
  box: Box | null;
  /** Detector confidence from 0 to 1; null for pieces added by hand. */
  confidence: number | null;
  /** True when the person changed the part or color. */
  edited?: boolean;
};

/** Below this confidence a piece is flagged for checking. */
export const LOW_CONFIDENCE = 0.6;

/** A low-confidence piece nobody has corrected yet. */
export function needsCheck({
  confidence,
  edited,
}: Pick<Detection, "confidence" | "edited">) {
  return confidence !== null && confidence < LOW_CONFIDENCE && !edited;
}

export const SCAN_STAGES = ["detecting", "classifying", "coloring"] as const;
export type ScanStage = (typeof SCAN_STAGES)[number];

export const SCAN_FAILURES = [
  "no_pieces",
  "too_dark",
  "too_blurry",
  "network",
  "timeout",
] as const;
export type ScanFailure = (typeof SCAN_FAILURES)[number];

/** Who's logged in (contract, "4. Accounts"). */
export type Account = {
  id: string;
  /** As the backend keeps it: trimmed and lowercased. */
  email: string;
  /** ISO 8601 time the account was made. */
  createdAt: string;
};

/** Why logging in or making an account failed, for the form to say. */
export const AUTH_FAILURES = [
  "invalid_credentials",
  "email_taken",
  "rate_limited",
] as const;
export type AuthFailure = (typeof AUTH_FAILURES)[number];

export const THEMES = ["vehicles", "animals", "buildings", "surprise"] as const;
export type Theme = (typeof THEMES)[number];

/** For untrusted input such as `?theme=` in a URL. */
export function isTheme(value: unknown): value is Theme {
  return (THEMES as readonly unknown[]).includes(value);
}

/** The themes ideas belong to; "surprise" mixes them. */
export type IdeaTheme = Exclude<Theme, "surprise">;

export type Difficulty = "easy" | "medium" | "hard";

export type Scan = {
  id: string;
  /** ISO 8601 time the photo was scanned. */
  createdAt: string;
  photo: Photo;
  detections: Detection[];
  /** The theme last used for ideas, to preselect it next time. */
  lastTheme?: Theme;
  /** The latest ideas for this scan; each request for ideas replaces them. */
  ideas?: IdeaSet;
};

/** One build idea, already checked against the inventory (the PRD's cek_inventori). */
export type Idea = {
  id: string;
  theme: IdeaTheme;
  difficulty: Difficulty;
  title: string;
  summary: string;
  steps: string[];
  /** Parts the person owns that the build uses. */
  used: PartCount[];
  /** Parts the build needs that the person doesn't have. */
  missing: PartCount[];
  /**
   * The checked build this idea is: the library's (ADR-0010), or one the agent
   * built from the scan's photo and pieces (ADR-0013).
   */
  buildId?: string;
  /** Pictures of that build; sent with `buildId`, or neither is. */
  preview?: Preview;
};

/**
 * An idea the agent is still building from the scan (ADR-0013): it joins the
 * set's `items` with the same id when it's done, with its picture.
 */
export type BuildingIdea = { id: string; theme: IdeaTheme };

/**
 * A checked build's picture and LDraw model, as URLs: an isometric 640 px
 * square WebP on a transparent background, and an `.ldr` download. Both are
 * public and versioned, so they load in a plain `<img>` or link.
 */
export type Preview = { image: string; model: string };

/**
 * One answer to a request for ideas, kept with the scan. Ideas are written once,
 * in the language they were asked in (ADR-0004), and never translated after.
 */
export type IdeaSet = {
  /** The theme asked for; "surprise" mixes themes. */
  theme: Theme;
  /** The language the ideas are written in. */
  locale: Locale;
  items: Idea[];
  /**
   * Ideas still being built, in order; left out when there are none. Each
   * joins `items` when it's done, so a screen reads the set again until then.
   */
  building?: BuildingIdea[];
};

/** A stored idea and the set it belongs to, as written. */
export type StoredIdea = { idea: Idea; set: IdeaSet };

/** A correction to a scan's detections. */
export type DetectionChange =
  | { type: "edit"; id: string; part?: BrickPartId; color?: BrickColorId }
  | { type: "remove"; id: string }
  | {
      type: "add";
      part: BrickPartId;
      color: BrickColorId;
      quantity: number;
    }
  /** Puts a piece back exactly as it was, box and confidence included. Used for undo. */
  | { type: "restore"; detection: Detection };
