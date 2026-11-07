/* Motion helpers. The timings live in tokens.css; these read them, decide when
 * motion should run, and do the small sums the animated components need.
 */

/** Sibling runs click in one after another, up to this many steps. */
export const MAX_STAGGER = 7;

/** The stagger step for the nth sibling, capped so long lists never wait. */
export function staggerIndex(index: number) {
  return Math.max(0, Math.min(index, MAX_STAGGER));
}

/** Digits of a count, most significant first: 108 → [1, 0, 8]. */
export function digitsOf(value: number): number[] {
  const whole = Math.max(0, Math.round(Math.abs(value)));
  return String(whole).split("").map(Number);
}

/** A CSS time such as "200ms" or "0.2s" in milliseconds; 0 when unreadable. */
export function parseDuration(value: string) {
  const match = /^\s*(-?[\d.]+)(ms|s)\s*$/.exec(value);
  if (!match) return 0;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return match[2] === "s" ? amount * 1000 : amount;
}

/** A duration token from tokens.css, such as `--duration-exit`, in milliseconds. */
export function readDuration(token: `--${string}`) {
  if (typeof window === "undefined") return 0;
  return parseDuration(
    getComputedStyle(document.documentElement).getPropertyValue(token),
  );
}

function matches(query: string) {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(query).matches
  );
}

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion() {
  return matches(REDUCED_MOTION_QUERY);
}

/** A mouse or trackpad: something that can hover precisely. */
export function hasFinePointer() {
  return matches("(hover: hover) and (pointer: fine)");
}

/**
 * A tiny tap felt when a piece snaps into place, on phones that support it.
 * Skipped with a mouse, under reduced motion and where vibration isn't available.
 */
export function snapHaptic() {
  if (prefersReducedMotion() || !matches("(pointer: coarse)")) return false;
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) {
    return false;
  }
  return navigator.vibrate(8);
}

type Point = { x: number; y: number };
type Rect = { left: number; top: number; width: number; height: number };

/**
 * How far a magnetic control leans toward the pointer. Inside `radius` px of
 * its edge it moves up to `strength` px, more the closer the pointer gets.
 */
export function magnetOffset(
  pointer: Point,
  rect: Rect,
  { radius = 64, strength = 6 }: { radius?: number; strength?: number } = {},
): Point {
  const center = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
  const dx = pointer.x - center.x;
  const dy = pointer.y - center.y;
  // Distance from the control's edge, 0 inside it.
  const outside = Math.hypot(
    Math.max(Math.abs(dx) - rect.width / 2, 0),
    Math.max(Math.abs(dy) - rect.height / 2, 0),
  );
  if (outside >= radius) return { x: 0, y: 0 };
  const pull = (1 - outside / radius) * strength;
  const length = Math.hypot(dx, dy) || 1;
  const round = (value: number) => Math.round(value * 10) / 10;
  return { x: round((dx / length) * pull), y: round((dy / length) * pull) };
}
