import { cx } from "@/lib/cx";

/** A 2×2 brick seen from above, inside a viewfinder: "scan your bricks". */
export function LogoMark({
  className,
  title,
}: {
  className?: string;
  /** Set when the mark stands alone; leave empty next to the wordmark. */
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path
        d="M3 10V5a2 2 0 0 1 2-2h5M22 3h5a2 2 0 0 1 2 2v5M29 22v5a2 2 0 0 1-2 2h-5M10 29H5a2 2 0 0 1-2-2v-5"
        stroke="var(--logo-ink)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect
        x="8"
        y="8"
        width="16"
        height="16"
        rx="2.5"
        fill="var(--logo-brick)"
        stroke="var(--logo-ink)"
        strokeWidth="1.75"
      />
      {[
        [12.5, 12.5],
        [19.5, 12.5],
        [12.5, 19.5],
        [19.5, 19.5],
      ].map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="2.4"
          fill="var(--logo-brick)"
          stroke="var(--logo-ink)"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2", className)}>
      <LogoMark className="size-8" />
      <span className="text-xl font-extrabold tracking-tight text-ink">
        Legoin
      </span>
    </span>
  );
}
