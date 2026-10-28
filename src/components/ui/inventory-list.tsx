import {
  BRICK_COLORS,
  BRICK_PARTS,
  brickColorVar,
  type PartCount,
} from "@/lib/bricks";
import { cx } from "@/lib/cx";

/** Inventory as tiles: color chip, count and part, then the color name. */
export function InventoryList({
  items,
  className,
}: {
  items: PartCount[];
  className?: string;
}) {
  return (
    <ul className={cx("grid grid-cols-2 gap-2", className)}>
      {items.map(({ part, color, quantity }) => (
        <li
          key={`${part}-${color}`}
          className="flex items-center gap-2.5 rounded-callout border-2 border-ink bg-card px-3 py-2"
        >
          <span
            aria-hidden="true"
            className="size-4 shrink-0 rounded-full border-2 border-ink"
            style={{ backgroundColor: brickColorVar(color) }}
          />
          <span className="text-sm leading-tight">
            <span className="font-mono font-bold">{quantity}×</span>{" "}
            {BRICK_PARTS[part].label}
            <span className="block text-ink-secondary">
              {BRICK_COLORS[color].label}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
