"use client";

import {
  createContext,
  type ReactNode,
  use,
  useSyncExternalStore,
} from "react";
import { prefersReducedMotion, REDUCED_MOTION_QUERY } from "@/lib/motion";

/** Set by `MotionPreview` to show a subtree as it looks with reduced motion. */
const ReducedMotionOverride = createContext<boolean | null>(null);

/**
 * Renders its children as if reduced motion were on (or off), for previews such
 * as /desain/gerak. Pair it with `data-motion="reduce"` so the CSS follows.
 */
export function MotionPreview({
  reduced,
  children,
}: {
  reduced: boolean;
  children: ReactNode;
}) {
  return (
    <ReducedMotionOverride value={reduced}>{children}</ReducedMotionOverride>
  );
}

function subscribe(onChange: () => void) {
  if (typeof window.matchMedia !== "function") return () => {};
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * True when motion should be reduced: the system setting, unless a
 * `MotionPreview` above says otherwise. The server assumes full motion; CSS
 * handles the first paint either way.
 */
export function useReducedMotion() {
  const override = use(ReducedMotionOverride);
  const system = useSyncExternalStore(
    subscribe,
    prefersReducedMotion,
    () => false,
  );
  return override ?? system;
}
