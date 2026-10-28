import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

/** A die-cut panel: white surface, thick ink outline and a hard ink shadow. */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cx(
        "rounded-card border-[2.5px] border-ink bg-card p-5 shadow-card",
        className,
      )}
      {...props}
    />
  );
}
