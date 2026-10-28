import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "highlight";

// Ink text on every tint; the fill and the label carry the meaning together.
const tones: Record<BadgeTone, string> = {
  neutral: "bg-page",
  success: "bg-success-subtle",
  warning: "bg-warning-subtle",
  danger: "bg-danger-subtle",
  // Solid LEGO yellow, so it never reads as the pale warning tint.
  highlight: "bg-highlight",
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
        "inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-2.5 py-0.5 text-sm font-semibold text-ink",
        tones[tone],
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
