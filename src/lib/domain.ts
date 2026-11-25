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
  /** The checked build this idea is, from the backend's library (ADR-0010). */
  buildId?: string;
  /** Pictures of that build; sent with `buildId`, or neither is. */
  preview?: Preview;
  /**
   * For an idea the agent wrote, when the backend builds previews (contract,
   * "Idea previews"): `pending` while it's built, `on_open` until the idea's
   * page is opened, `ready` with `buildId` and `preview`, `unavailable` when
   * none will come. Once `ready`, the idea's steps and parts are the build's.
   */
  previewStatus?: PreviewStatus;
};

export const PREVIEW_STATUSES = [
  "pending",
  "on_open",
  "ready",
  "unavailable",
] as const;
export type PreviewStatus = (typeof PREVIEW_STATUSES)[number];

/** Whether a preview is on its way, so the screen polls for it. */
export function previewComing(idea: Pick<Idea, "previewStatus">) {
  return idea.previewStatus === "pending" || idea.previewStatus === "on_open";
}

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

/* Picture builds (contract, "13. Picture builds", ADR-0012): a person uploads a
 * picture and the agent designs a checked LEGO build of it from the catalogue.
 */

export const PICTURE_STAGES = [
  "queued",
  "designing",
  "checking",
  "rendering",
] as const;
export type PictureStage = (typeof PICTURE_STAGES)[number];

/**
 * Why a picture build failed or wasn't started, for the screen to say: the
 * API's own codes, `unavailable` when picture builds are off or busy, and
 * `network` when there was no usable answer or anything else went wrong.
 */
export const PICTURE_FAILURES = [
  "picture_unusable",
  "picture_refused",
  "no_valid_build",
  "picture_limit",
  "picture_budget",
  "timeout",
  "unavailable",
  "network",
] as const;
export type PictureFailure = (typeof PICTURE_FAILURES)[number];

/** `cek_inventori` of a picture build's parts against one of the person's scans. */
export type PictureCheck = {
  scanId: string;
  /** Parts the person owns that the build uses. */
  used: PartCount[];
  /** Parts the build needs that the person doesn't have. */
  missing: PartCount[];
};

/** A checked build of an uploaded picture, kept with the account. */
export type PictureBuild = {
  id: string;
  /** ISO 8601 time the build was saved. */
  createdAt: string;
  /** The language its title, summary and steps are written in. */
  locale: Locale;
  title: string;
  summary: string;
  steps: string[];
  /** Every part the build needs. */
  parts: PartCount[];
  /** The uploaded picture, as kept. */
  picture: Photo;
  /** The rendered build and its LDraw model. */
  preview: Preview;
  /** True when a limit ended the job: the title, summary and steps are plain ones. */
  plain?: true;
  /** Only when asked for against a scan. */
  check?: PictureCheck;
};

/** Whether the account can start a picture build now, and how many it has left. */
export type PictureQuota = {
  available: boolean;
  /** Why not: off on this backend, the day's limit reached, or the budget spent. */
  reason?: "off" | "limit" | "budget";
  /** Picture builds started today (UTC). */
  used: number;
  /** How many a day. */
  limit: number;
  /** ISO 8601: the next midnight UTC, when `used` goes back to 0. */
  resetsAt: string;
};
