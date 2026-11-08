import type { CSSProperties } from "react";
import { cx } from "@/lib/cx";
import type { LabelPlacement } from "@/lib/detection-labels";
import type { Box } from "@/lib/domain";

export type { Box };

/** "always", "wide" (hidden on phones, where labels would collide) or "never". */
export type LabelMode = "always" | "wide" | "never";

const percent = (value: number) => `${value * 100}%`;

// Where a label sits on its box, by `LabelPlacement`. Labels are `z-10` in an
// `isolate`d box, so they draw over the selected box's dotted footprint (its
// `::after`) without rising over other boxes.
const LABEL_PLACES = {
  above: {
    left: "bottom-full -left-0.5 mb-1",
    right: "bottom-full -right-0.5 mb-1",
  },
  inside: { left: "top-0 left-0", right: "top-0 right-0" },
  below: {
    left: "top-full -left-0.5 mt-1",
    right: "top-full -right-0.5 mt-1",
  },
} as const;

/**
 * One detected piece over a photo. Place it inside a `relative` container that holds the image.
 * Ink stroke with a white halo reads on every brick color, including red. With `onSelect`
 * it becomes a button named by `name`; flagged pieces are dashed with a yellow label.
 * It clicks in when it appears (after `order` earlier boxes), lifts off the photo
 * when selected, and pops off while `leaving`. The label sits above the box's
 * left side unless `placement` (from `fitLabels`) moves it.
 */
export function DetectionBox({
  box,
  label,
  name,
  selected = false,
  flagged = false,
  labelMode = "always",
  placement = { side: "above", align: "left" },
  order,
  leaving = false,
  onSelect,
}: {
  box: Box;
  label?: string;
  name?: string;
  selected?: boolean;
  flagged?: boolean;
  labelMode?: LabelMode;
  /** Where the label sits, so the photo's frame doesn't cut it off. */
  placement?: LabelPlacement;
  /** Stagger step when boxes click in together; leave out to click in at once. */
  order?: number;
  /** Being removed: pops off the photo. */
  leaving?: boolean;
  onSelect?: () => void;
}) {
  const className = cx(
    "detection-box absolute isolate rounded-sm border-overlay outline-overlay-halo",
    leaving ? "pop-off" : "click-in",
    selected ? "border-[3px] outline-2" : "border-2 outline-1",
    flagged && "border-dashed",
  );
  const style = {
    left: percent(box.x),
    top: percent(box.y),
    width: percent(box.width),
    height: percent(box.height),
    "--i": order ?? 0,
  } as CSSProperties;
  const lifted = selected ? "" : undefined;
  const tag = label && labelMode !== "never" && (
    <span
      aria-hidden={onSelect ? true : undefined}
      className={cx(
        "absolute z-10 rounded-sm px-1.5 py-0.5 font-mono text-xs font-semibold whitespace-nowrap",
        LABEL_PLACES[placement.side][placement.align],
        flagged
          ? "bg-highlight text-highlight-foreground ring-1 ring-overlay"
          : "bg-overlay text-overlay-foreground",
        labelMode === "wide" && "max-sm:hidden",
      )}
    >
      {label}
    </span>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        aria-label={name}
        aria-pressed={selected}
        data-selected={lifted}
        onClick={onSelect}
        className={cx(className, "cursor-pointer")}
        style={style}
      >
        {tag}
      </button>
    );
  }
  return (
    <div className={className} style={style} data-selected={lifted}>
      {tag}
    </div>
  );
}
