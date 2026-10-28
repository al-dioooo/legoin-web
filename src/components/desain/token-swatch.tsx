"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/lib/cx";

/** A color token with its resolved value, read from the CSS so tokens.css stays the only source. */
export function TokenSwatch({
  token,
  label = token,
  note,
  className,
}: {
  token: string;
  label?: string;
  note?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (ref.current) {
      setValue(
        getComputedStyle(ref.current).getPropertyValue(`--${token}`).trim(),
      );
    }
  }, [token]);

  return (
    <div className={cx("flex min-w-0 flex-col gap-1.5", className)}>
      <span
        ref={ref}
        aria-hidden="true"
        className="h-12 rounded-callout border border-line"
        style={{ backgroundColor: `var(--${token})` }}
      />
      <span className="truncate font-mono text-xs font-semibold text-ink">
        {label}
      </span>
      <span className="font-mono text-xs text-ink-secondary">
        {value || " "}
      </span>
      {note && (
        <span className="text-xs leading-snug text-ink-secondary">{note}</span>
      )}
    </div>
  );
}
