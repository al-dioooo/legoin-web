"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ViewTransition } from "react";
import { STEP_BACK } from "@/components/motion/view-transitions";
import { cx } from "@/lib/cx";
import { FLOW_STEPS, type FlowStep, flowPosition } from "@/lib/flow";

/**
 * Photo → Pieces → Ideas. Steps already done link back; later ones are plain
 * text. The yellow marker on the current step is one piece: moving to another
 * step, it slides over and clicks into place there.
 */
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
      {/* Wraps rather than scrolls when it can't fit, e.g. with wider text
          spacing; the radius matches rounded-full on one line. */}
      <ol className="inline-flex flex-wrap items-center gap-1 rounded-[1.625rem] border-[2.5px] border-ink bg-page p-1 shadow-sticker">
        {FLOW_STEPS.map((step, index) => {
          const href = hrefs[step];
          // Named for view transitions, so the labels stay above the marker
          // while it slides between steps.
          const content = (
            <span
              className="inline-flex items-center gap-2"
              style={{ viewTransitionName: `step-label-${step}` }}
            >
              <span
                aria-hidden="true"
                className="grid size-6 place-items-center rounded-full border-2 border-ink bg-card font-display text-xs"
              >
                {index + 1}
              </span>
              {labels[step]}
            </span>
          );
          const base =
            "relative isolate inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-sm font-semibold min-[22.5rem]:px-3";
          return (
            <li key={step}>
              {index < currentIndex && href ? (
                <Link
                  href={href}
                  transitionTypes={[STEP_BACK]}
                  className={cx(base, "hover:bg-highlight-subtle")}
                >
                  {content}
                </Link>
              ) : (
                <span
                  aria-current={index === currentIndex ? "step" : undefined}
                  className={cx(
                    base,
                    index !== currentIndex && "text-ink-secondary",
                  )}
                >
                  {index === currentIndex && (
                    <ViewTransition
                      name="step-marker"
                      share="step-morph"
                      default="none"
                    >
                      {/* Outlined, so the current step doesn't rest on
                          yellow alone, which forced colors drop. */}
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 rounded-full border-2 border-ink bg-highlight"
                      />
                    </ViewTransition>
                  )}
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
