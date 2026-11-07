"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { hasFinePointer } from "@/lib/motion";

/**
 * Lights the baseplate studs around a mouse pointer. Put it first inside a
 * `.baseplate`. Updates run once per animation frame and only move a mask, so
 * nothing is laid out again; touch screens and reduced motion never see it.
 */
export function StudGlow() {
  const layer = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const glow = layer.current;
    const plate = glow?.parentElement;
    if (!glow || !plate || reduced || !hasFinePointer()) return;

    let frame = 0;
    let pointer: { x: number; y: number } | null = null;

    function paint() {
      frame = 0;
      if (!glow || !plate || !pointer) return;
      const box = plate.getBoundingClientRect();
      glow.style.setProperty("--glow-x", `${pointer.x - box.left}px`);
      glow.style.setProperty("--glow-y", `${pointer.y - box.top}px`);
      glow.style.setProperty("--glow-on", "1");
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
      glow?.style.setProperty("--glow-on", "0");
    }

    plate.addEventListener("pointermove", move, { passive: true });
    plate.addEventListener("pointerleave", leave);
    // The page scrolls under a still pointer, so follow it.
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      plate.removeEventListener("pointermove", move);
      plate.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", schedule);
      glow.style.removeProperty("--glow-on");
    };
  }, [reduced]);

  return <div ref={layer} aria-hidden="true" className="stud-glow" />;
}
