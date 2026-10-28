import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

/** A booklet page: white surface, hairline border, barely any shadow. */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cx(
        "rounded-card border border-line bg-card p-5 shadow-card",
        className,
      )}
      {...props}
    />
  );
}
