import { cx } from "@/lib/cx";
import type { Box } from "@/lib/domain";

export type { Box };

/** "always", "wide" (hidden on phones, where labels would collide) or "never". */
export type LabelMode = "always" | "wide" | "never";

const percent = (value: number) => `${value * 100}%`;

/**
 * One detected piece over a photo. Place it inside a `relative` container that holds the image.
 * Ink stroke with a white halo reads on every brick color, including red. With `onSelect`
 * it becomes a button named by `name`; flagged pieces are dashed with a yellow label.
 */
export function DetectionBox({
  box,
  label,
  name,
  selected = false,
  flagged = false,
  labelMode = "always",
  onSelect,
}: {
  box: Box;
  label?: string;
  name?: string;
  selected?: boolean;
  flagged?: boolean;
  labelMode?: LabelMode;
  onSelect?: () => void;
}) {
  const className = cx(
    "absolute rounded-sm border-overlay outline-overlay-halo",
    selected ? "border-[3px] outline-2" : "border-2 outline-1",
    flagged && "border-dashed",
  );
  const style = {
    left: percent(box.x),
    top: percent(box.y),
    width: percent(box.width),
    height: percent(box.height),
  };
  const tag = label && labelMode !== "never" && (
    <span
      aria-hidden={onSelect ? true : undefined}
      className={cx(
        "absolute bottom-full -left-0.5 mb-1 rounded-sm px-1.5 py-0.5 font-mono text-xs font-semibold whitespace-nowrap",
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
        onClick={onSelect}
        className={cx(className, "cursor-pointer")}
        style={style}
      >
        {tag}
      </button>
    );
  }
  return (
    <div className={className} style={style}>
      {tag}
    </div>
  );
}
