import { cx } from "@/lib/cx";
import type { Box } from "@/lib/domain";

export type { Box };

const percent = (value: number) => `${value * 100}%`;

/**
 * One detected piece over a photo. Place it inside a `relative` container that holds the image.
 * Ink stroke with a white halo reads on every brick color, including red.
 */
export function DetectionBox({
  box,
  label,
  selected = false,
}: {
  box: Box;
  label?: string;
  selected?: boolean;
}) {
  return (
    <div
      className={cx(
        "absolute rounded-sm border-overlay outline-overlay-halo",
        selected ? "border-[3px] outline-2" : "border-2 outline-1",
      )}
      style={{
        left: percent(box.x),
        top: percent(box.y),
        width: percent(box.width),
        height: percent(box.height),
      }}
    >
      {label && (
        <span className="absolute bottom-full -left-0.5 mb-1 rounded-sm bg-overlay px-1.5 py-0.5 font-mono text-xs font-semibold whitespace-nowrap text-overlay-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
