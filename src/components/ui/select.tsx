import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

type SelectProps = ComponentProps<"select"> & { label: string };

/** Native select wrapped in its label, so it needs no id to be labelled. */
export function Select({ label, className, children, ...props }: SelectProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
      {label}
      <span className="relative">
        <select
          className={cx(
            "min-h-12 w-full appearance-none rounded-control border-[2.5px] border-ink bg-card pr-10 pl-4 text-base font-medium text-ink",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </span>
    </label>
  );
}
