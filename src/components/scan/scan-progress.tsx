"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { cx } from "@/lib/cx";
import { type Photo, SCAN_STAGES, type ScanStage } from "@/lib/domain";

type Copy = Dictionary["scan"]["progress"];
type StageState = "done" | "current" | "waiting";

/** The PRD's target from photo to recommendations. */
export const SLOW_AFTER_SECONDS = 15;

function StageMark({ state }: { state: StageState }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "grid size-7 shrink-0 place-items-center rounded-full border-2 border-ink",
        state === "done" && "bg-success-subtle",
        state === "current" && "bg-highlight",
        state === "waiting" && "bg-card",
      )}
    >
      {state === "done" && (
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3.5 8.5 3 3 6-7" />
        </svg>
      )}
      {state === "current" && (
        <span className="size-2.5 animate-pulse rounded-full bg-ink motion-reduce:animate-none" />
      )}
    </span>
  );
}

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** The pipeline's three stages while a photo is scanned. */
export function ScanProgress({
  photo,
  stage,
  elapsedSeconds,
  copy,
  onCancel,
}: {
  photo: Photo;
  stage: ScanStage;
  elapsedSeconds: number;
  copy: Copy;
  onCancel: () => void;
}) {
  const current = SCAN_STAGES.indexOf(stage);
  const slow = elapsedSeconds >= SLOW_AFTER_SECONDS;
  const heading = useRef<HTMLHeadingElement>(null);
  // The Scan button that had focus is gone; hand focus to this view.
  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <section
      aria-labelledby="progress-title"
      className="rounded-card border-[2.5px] border-ink bg-card p-4 shadow-card sm:p-6"
    >
      <div className="grid gap-6 md:grid-cols-2 md:items-center">
        <div className="relative overflow-hidden rounded-callout border-2 border-ink">
          <Image
            src={photo.src}
            width={photo.width}
            height={photo.height}
            alt={copy.photoAlt}
            unoptimized
            className="block h-auto w-full"
          />
          <span
            aria-hidden="true"
            className="absolute inset-x-0 h-1 animate-scan-sweep bg-highlight shadow-[0_0_0_1.5px_var(--text-primary)] motion-reduce:hidden"
          />
        </div>

        <div>
          <h2
            ref={heading}
            id="progress-title"
            tabIndex={-1}
            className="font-display text-2xl outline-none"
          >
            {copy.title}
          </h2>
          <ol className="mt-5 space-y-3">
            {SCAN_STAGES.map((name, index) => {
              const state: StageState =
                index < current
                  ? "done"
                  : index === current
                    ? "current"
                    : "waiting";
              return (
                <li key={name} className="flex items-center gap-3">
                  <StageMark state={state} />
                  <span
                    className={cx(
                      "font-semibold",
                      state === "waiting" && "text-ink-secondary",
                    )}
                  >
                    {copy.stages[name]}
                  </span>
                  <span className="sr-only">({copy.status[state]})</span>
                </li>
              );
            })}
          </ol>

          <p className="mt-5 font-mono text-sm">
            <span className="text-ink-secondary">{copy.elapsed}</span>{" "}
            <span className="font-bold tabular-nums">
              {clock(elapsedSeconds)}
            </span>
          </p>
          <div aria-live="polite" className="mt-2 min-h-5 text-sm">
            <span className="sr-only">{copy.stages[stage]}</span>
            {slow && <span>{copy.slow}</span>}
          </div>

          <Button variant="secondary" onClick={onCancel} className="mt-4">
            {copy.cancel}
          </Button>
        </div>
      </div>
    </section>
  );
}
