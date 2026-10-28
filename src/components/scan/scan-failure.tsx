"use client";

import { useEffect, useRef } from "react";
import { Button, buttonStyles } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { ScanFailure } from "@/lib/domain";

type Copy = Dictionary["scan"]["failures"];

/** What went wrong with a scan, and the way forward for that reason. */
export function ScanFailureView({
  reason,
  copy,
  onRetake,
  onRetry,
}: {
  reason: ScanFailure;
  copy: Copy;
  onRetake: () => void;
  onRetry: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  // Move focus here so screen readers announce what happened.
  useEffect(() => {
    heading.current?.focus();
  }, []);

  const message = copy[reason];
  // A dropped connection keeps the photo; the other reasons need a new one.
  const canRetry = reason === "network";

  return (
    <section
      aria-labelledby="failure-title"
      className="rounded-card border-[2.5px] border-ink bg-danger-subtle p-5 shadow-card sm:p-6"
    >
      <h2
        ref={heading}
        id="failure-title"
        tabIndex={-1}
        className="font-display text-2xl outline-none"
      >
        {message.title}
      </h2>
      <p className="mt-2 max-w-xl">{message.body}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {canRetry ? (
          <>
            <Button onClick={onRetry}>{copy.retry}</Button>
            <Button variant="secondary" onClick={onRetake}>
              {copy.retake}
            </Button>
          </>
        ) : (
          <Button onClick={onRetake}>{copy.retake}</Button>
        )}
        <a href="#photo-tips" className={buttonStyles({ variant: "ghost" })}>
          {copy.tips}
        </a>
      </div>
    </section>
  );
}
