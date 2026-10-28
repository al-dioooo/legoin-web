import { BrickGlyph } from "@/components/ui/brick-glyph";
import {
  BRICK_COLORS,
  BRICK_PARTS,
  describePart,
  type PartCount,
} from "@/lib/bricks";
import { cx } from "@/lib/cx";

type PartCalloutProps = {
  title: string;
  parts: PartCount[];
  /** Parts the user doesn't have: dashed frame instead of a filled box. */
  missing?: boolean;
  /** Show part and color names under each count, for inventories. */
  detailed?: boolean;
  className?: string;
};

/** A parts box: each part drawn from above with its count. */
export function PartCallout({
  title,
  parts,
  missing = false,
  detailed = false,
  className,
}: PartCalloutProps) {
  return (
    <section
      aria-label={title}
      className={cx(
        "rounded-callout border-2 border-ink p-4",
        missing ? "border-dashed bg-page" : "bg-card",
        className,
      )}
    >
      <p className="mb-3 font-mono text-xs font-bold tracking-[0.2em] text-ink uppercase">
        {title}
      </p>
      <ul className="flex flex-wrap items-end gap-x-6 gap-y-4">
        {parts.map((item) => (
          <li
            key={`${item.part}-${item.color}`}
            className="flex flex-col items-start gap-1.5"
          >
            <BrickGlyph part={item.part} color={item.color} />
            <span className="sr-only">{describePart(item)}</span>
            <span
              aria-hidden="true"
              className="font-mono text-sm font-bold text-ink"
            >
              {item.quantity}×
            </span>
            {detailed && (
              <span
                aria-hidden="true"
                className="text-xs leading-tight text-ink-secondary"
              >
                {BRICK_PARTS[item.part].label}
                <br />
                {BRICK_COLORS[item.color].label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
