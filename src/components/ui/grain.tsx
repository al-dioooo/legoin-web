import { cx } from "@/lib/cx";

/**
 * Print-like film grain over its `relative` parent. Keep it off scan photos and
 * inventories, where people judge brick colors.
 */
export function Grain({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cx("grain", className)} />;
}
