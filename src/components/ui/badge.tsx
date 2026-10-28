import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "highlight";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-callout text-ink-secondary",
  success: "bg-success-subtle text-success-subtle-foreground",
  warning: "bg-warning-subtle text-warning-subtle-foreground",
  danger: "bg-danger-subtle text-danger-subtle-foreground",
  highlight: "bg-highlight-subtle text-highlight-subtle-foreground",
};

/** Status is never color alone: every badge has a dot and a text label. */
export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-semibold",
        tones[tone],
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
