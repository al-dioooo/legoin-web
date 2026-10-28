"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";
import { FLOW_STEPS, type FlowStep, flowPosition } from "@/lib/flow";

/** Photo → Pieces → Ideas. Steps already done link back; later ones are plain text. */
export function StepProgress({
  labels,
  className,
}: {
  labels: Record<FlowStep, string> & { label: string };
  className?: string;
}) {
  const pathname = usePathname();
  const { current, hrefs } = flowPosition(pathname);
  if (!current) return null;
  const currentIndex = FLOW_STEPS.indexOf(current);

  return (
    <nav aria-label={labels.label} className={className}>
      <ol className="inline-flex items-center gap-1 rounded-full border-[2.5px] border-ink bg-page p-1 shadow-sticker">
        {FLOW_STEPS.map((step, index) => {
          const href = hrefs[step];
          const content = (
            <>
              <span
                aria-hidden="true"
                className="grid size-6 place-items-center rounded-full border-2 border-ink bg-card font-display text-xs"
              >
                {index + 1}
              </span>
              {labels[step]}
            </>
          );
          const base =
            "inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold";
          return (
            <li key={step}>
              {index < currentIndex && href ? (
                <Link
                  href={href}
                  className={cx(base, "hover:bg-highlight-subtle")}
                >
                  {content}
                </Link>
              ) : (
                <span
                  aria-current={index === currentIndex ? "step" : undefined}
                  className={cx(
                    base,
                    index === currentIndex
                      ? "bg-highlight"
                      : "text-ink-secondary",
                  )}
                >
                  {content}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
