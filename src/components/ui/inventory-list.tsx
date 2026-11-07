import type { CSSProperties } from "react";
import { Odometer } from "@/components/motion/odometer";
import type { Locale } from "@/i18n/locales";
import {
  BRICK_PARTS,
  brickColorVar,
  colorLabel,
  type PartCount,
} from "@/lib/bricks";
import { cx } from "@/lib/cx";
import { inventoryKey } from "@/lib/inventory";
import { staggerIndex } from "@/lib/motion";

/**
 * Inventory as tiles: color chip, count and part, then the color name. With
 * `onSelect` each tile is a button; lines holding a flagged piece are dashed.
 * Tiles click in one after another, the selected one slides out like a part
 * callout, and counts roll like an odometer when they change.
 */
export function InventoryList({
  items,
  locale,
  selectedKey,
  flaggedKeys,
  flaggedLabel,
  editedKeys,
  editedLabel,
  onSelect,
  assembling = true,
  leavingKey,
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
  /** Lines holding a piece the person corrected or added. */
  editedKeys?: ReadonlySet<string>;
  /** Shown on an edited line, e.g. "Edited". */
  editedLabel?: string;
  onSelect?: (line: PartCount) => void;
  /** Tiles click in one after another; turn off once they're in. */
  assembling?: boolean;
  /** `inventoryKey` of a line about to disappear, which pops off. */
  leavingKey?: string;
  className?: string;
}) {
  return (
    <ul className={cx("grid grid-cols-2 gap-2", className)}>
      {items.map((line, index) => {
        const key = inventoryKey(line);
        const selected = key === selectedKey;
        const flagged = flaggedKeys?.has(key) ?? false;
        const tileClass = cx(
          "part-tile flex h-full w-full items-center gap-2.5 rounded-callout border-ink px-3 py-2 text-left",
          selected ? "border-[3px] bg-highlight" : "border-2 bg-card",
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
              <span className="font-mono font-bold">
                <span className="sr-only">{line.quantity}×</span>
                <span aria-hidden="true">
                  <Odometer value={line.quantity} />×
                </span>
              </span>{" "}
              {BRICK_PARTS[line.part].label}
              <span
                className={cx(
                  "block",
                  selected ? "text-ink" : "text-ink-secondary",
                )}
              >
                {colorLabel(line.color, locale)}
              </span>
              {flagged && flaggedLabel && (
                <span className="sr-only">, {flaggedLabel}</span>
              )}
              {editedKeys?.has(key) && editedLabel && (
                <span className="mt-0.5 block text-xs font-bold">
                  <span className="sr-only">, </span>
                  {editedLabel}
                </span>
              )}
            </span>
          </>
        );
        return (
          <li
            key={key}
            className={key === leavingKey ? "pop-off" : "click-in"}
            style={
              { "--i": assembling ? staggerIndex(index) : 0 } as CSSProperties
            }
          >
            {onSelect ? (
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(line)}
                className={cx(
                  tileClass,
                  "cursor-pointer",
                  !selected && "hover:bg-highlight-subtle",
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
