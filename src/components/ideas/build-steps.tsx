"use client";

import { useId, useState } from "react";
import { StepNumber } from "@/components/ui/step-number";
import { fill } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { cx } from "@/lib/cx";

type Copy = {
  /** "Step {step} done", for each checkbox. */
  markDone: string;
  /** "{done} of {total} steps done". */
  progress: string;
  allDone: string;
  /** The step number's label. */
  step: string;
};

/** Numbered steps that click in one by one and can be ticked off, locally. */
export function BuildSteps({
  steps,
  lang,
  copy,
  className,
}: {
  steps: string[];
  lang: Locale;
  copy: Copy;
  className?: string;
}) {
  const [done, setDone] = useState<ReadonlySet<number>>(() => new Set());
  const idPrefix = useId();

  function toggle(index: number) {
    setDone((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className={className}>
      <ol className="assemble space-y-3">
        {steps.map((step, index) => {
          const checked = done.has(index);
          const inputId = `${idPrefix}-${index + 1}`;
          return (
            <li
              // Steps are plain text and never reorder, so position is identity.
              // biome-ignore lint/suspicious/noArrayIndexKey: see above
              key={index}
              className={cx(
                "flex items-start gap-3 rounded-callout border-2 border-ink p-4 transition-colors",
                checked ? "bg-success-subtle" : "bg-card",
              )}
            >
              <StepNumber value={index + 1} label={copy.step} />
              {/* Clicking the text ticks the step too. */}
              <label
                htmlFor={inputId}
                lang={lang}
                className="flex-1 cursor-pointer self-center"
              >
                {step}
              </label>
              <span className="relative grid size-8 shrink-0 place-items-center self-center">
                <input
                  id={inputId}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(index)}
                  aria-label={fill(copy.markDone, { step: index + 1 })}
                  className="size-8 cursor-pointer appearance-none rounded-control border-[2.5px] border-ink bg-page checked:bg-highlight"
                />
                {checked && (
                  <svg
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    className="click-in pointer-events-none absolute size-4 text-ink"
                  >
                    <path
                      d="M3 8.5 6.5 12 13 4.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
            </li>
          );
        })}
      </ol>
      <output className="mt-3 block min-h-6 text-sm font-semibold">
        {done.size === 0
          ? ""
          : done.size === steps.length
            ? copy.allDone
            : fill(copy.progress, {
                done: done.size,
                total: steps.length,
              })}
      </output>
    </div>
  );
}
