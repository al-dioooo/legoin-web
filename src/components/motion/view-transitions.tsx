import { type ReactNode, ViewTransition } from "react";

/** Transition types the scan flow passes to `router.push` and `Link`. */
export const STEP_FORWARD = "step-forward";
export const STEP_BACK = "step-back";

/**
 * The scan photo, as one object from the preview through the scanner to the
 * results: wherever it shows up next, it morphs there from where it was. Wrap
 * exactly one element. It only animates when it changes places, never on
 * unrelated updates.
 */
export function SharedPhoto({ children }: { children: ReactNode }) {
  return (
    <ViewTransition name="scan-photo" share="photo-morph" default="none">
      {children}
    </ViewTransition>
  );
}
