"use client";

import { useCallback } from "react";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { hasFinePointer, magnetOffset } from "@/lib/motion";

/**
 * A ref callback that makes a `.press` control lean toward a nearby mouse
 * pointer, by setting --magnet-x and --magnet-y on it once per frame. Use it on
 * one primary action per screen at most. Off on touch screens and under
 * reduced motion.
 */
export function useMagnetic(options?: { radius?: number; strength?: number }) {
  const reduced = useReducedMotion();
  const radius = options?.radius;
  const strength = options?.strength;

  return useCallback(
    (element: HTMLElement | null) => {
      if (!element || reduced || !hasFinePointer()) return;

      let frame = 0;
      let pointer: { x: number; y: number } | null = null;
      let current = { x: 0, y: 0 };

      function paint() {
        frame = 0;
        if (!element) return;
        const box = element.getBoundingClientRect();
        // Measure where the control rests, without its current lean.
        const rest = {
          left: box.left - current.x,
          top: box.top - current.y,
          width: box.width,
          height: box.height,
        };
        current = pointer
          ? magnetOffset(pointer, rest, { radius, strength })
          : { x: 0, y: 0 };
        element.style.setProperty("--magnet-x", `${current.x}px`);
        element.style.setProperty("--magnet-y", `${current.y}px`);
      }
      function schedule() {
        if (!frame) frame = requestAnimationFrame(paint);
      }
      function move(event: PointerEvent) {
        if (event.pointerType === "touch") return;
        pointer = { x: event.clientX, y: event.clientY };
        schedule();
      }
      function leave() {
        pointer = null;
        schedule();
      }

      document.addEventListener("pointermove", move, { passive: true });
      document.documentElement.addEventListener("pointerleave", leave);
      return () => {
        cancelAnimationFrame(frame);
        document.removeEventListener("pointermove", move);
        document.documentElement.removeEventListener("pointerleave", leave);
        element.style.removeProperty("--magnet-x");
        element.style.removeProperty("--magnet-y");
      };
    },
    [reduced, radius, strength],
  );
}
