import type { Locale } from "@/i18n/locales";
import {
  BRICK_PARTS,
  brickColorVar,
  colorLabel,
  type PartCount,
} from "@/lib/bricks";
import { cx } from "@/lib/cx";
import { inventoryKey } from "@/lib/inventory";

/**
 * Inventory as tiles: color chip, count and part, then the color name. With
 * `onSelect` each tile is a button; lines holding a flagged piece are dashed.
 */
export function InventoryList({
  items,
  locale,
  selectedKey,
  flaggedKeys,
  flaggedLabel,
  onSelect,
  className,
}: {
  items: PartCount[];
  locale: Locale;
  /** `inventoryKey` of the line to highlight. */
  selectedKey?: string;
  /** Lines with a piece below the confidence threshold. */
  flaggedKeys?: ReadonlySet<string>;
  /** Spoken after a flagged line, e.g. "Check this". */
  flaggedLabel?: string;
  onSelect?: (line: PartCount) => void;
  className?: string;
}) {
  return (
    <ul className={cx("grid grid-cols-2 gap-2", className)}>
      {items.map((line) => {
        const key = inventoryKey(line);
        const selected = key === selectedKey;
        const flagged = flaggedKeys?.has(key) ?? false;
        const tileClass = cx(
          "flex h-full w-full items-center gap-2.5 rounded-callout border-ink px-3 py-2 text-left",
          selected ? "border-[3px] bg-highlight-subtle" : "border-2 bg-card",
          flagged && "border-dashed",
        );
        const content = (
          <>
            <span
              aria-hidden="true"
              className="size-4 shrink-0 rounded-full border-2 border-ink"
              style={{ backgroundColor: brickColorVar(line.color) }}
            />
            <span className="text-sm leading-tight">
              <span className="font-mono font-bold">{line.quantity}×</span>{" "}
              {BRICK_PARTS[line.part].label}
              <span className="block text-ink-secondary">
                {colorLabel(line.color, locale)}
              </span>
              {flagged && flaggedLabel && (
                <span className="sr-only">, {flaggedLabel}</span>
              )}
            </span>
          </>
        );
        return (
          <li key={key}>
            {onSelect ? (
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(line)}
                className={cx(
                  tileClass,
                  "cursor-pointer hover:bg-highlight-subtle",
                )}
              >
                {content}
              </button>
            ) : (
              <div className={tileClass}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
