import { cx } from "@/lib/cx";

/** A numbered step, as a yellow sticker. */
export function StepNumber({
  value,
  label,
  className,
}: {
  value: number;
  /** Word screen readers say before the number, e.g. "Step". */
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full border-[2.5px] border-ink bg-highlight font-display text-lg text-highlight-foreground shadow-sticker",
        className,
      )}
    >
      <span className="sr-only">{label} </span>
      {value}
    </span>
  );
}
