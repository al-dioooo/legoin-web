import type { Locale } from "@/i18n/locales";
import { type BrickColorId, brickColorVar, colorLabel } from "@/lib/bricks";
import { cx } from "@/lib/cx";

/** A brick color always comes with its name, never as color alone. */
export function BrickSwatch({
  color,
  locale,
  className,
}: {
  color: BrickColorId;
  locale: Locale;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 text-sm font-medium text-ink",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="size-4 shrink-0 rounded-full border-2 border-ink"
        style={{ backgroundColor: brickColorVar(color) }}
      />
      {colorLabel(color, locale)}
    </span>
  );
}
