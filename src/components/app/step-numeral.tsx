"use client";

import { usePathname } from "next/navigation";
import { FLOW_STEPS, flowPosition } from "@/lib/flow";

/**
 * The current step's number, oversized and outlined, hanging off the edge of
 * the page like a step in a building-instructions booklet. Decorative: the step
 * progress names the step for screen readers.
 */
export function StepNumeral() {
  const { current } = flowPosition(usePathname());
  if (!current) return null;
  const number = FLOW_STEPS.indexOf(current) + 1;
  // Keyed by number, so a new step's numeral clicks in fresh.
  return (
    <span key={number} aria-hidden="true" className="step-numeral click-in">
      {number}
    </span>
  );
}
