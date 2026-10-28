import { cx } from "@/lib/cx";

/** The booklet's numbered step. */
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
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-ink font-mono text-lg font-bold text-ink",
        className,
      )}
    >
      <span className="sr-only">Langkah </span>
      {value}
    </span>
  );
}
