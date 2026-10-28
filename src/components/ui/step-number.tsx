import { cx } from "@/lib/cx";

/** A numbered step, as a yellow sticker. */
export function StepNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full border-[2.5px] border-ink bg-highlight font-display text-lg text-highlight-foreground shadow-sticker",
        className,
      )}
    >
      <span className="sr-only">Langkah </span>
      {value}
    </span>
  );
}
