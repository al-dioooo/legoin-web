"use client";

import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Holds one or more `Marquee` tapes with a button that pauses and plays them,
 * since moving text that runs on its own needs a way to stop it (WCAG 2.2.2).
 * Reduced motion already stops the tapes, so the button hides then.
 */
export function TapeBand({
  copy,
  children,
  className,
}: {
  copy: { pause: string; play: string };
  children: ReactNode;
  className?: string;
}) {
  const [paused, setPaused] = useState(false);
  return (
    <div data-paused={paused ? "" : undefined} className={className}>
      {children}
      <div className="mx-auto flex max-w-6xl justify-end px-4 pt-6 sm:px-6 motion-reduce:hidden">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? copy.play : copy.pause}
        </Button>
      </div>
    </div>
  );
}
