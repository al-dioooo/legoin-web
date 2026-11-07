import { type ReactNode, type Ref, useId } from "react";
import { cx } from "@/lib/cx";

type EmptyStateTone = "highlight" | "danger";

// The icon tile carries the tone; the card stays white so the text reads the same.
const tones: Record<EmptyStateTone, string> = {
  highlight: "bg-highlight",
  danger: "bg-danger-subtle",
};

/**
 * Nothing to show, or something went wrong: art in a sticker tile, a title, one
 * or two sentences and the way forward. Lists use it when they're empty; the
 * not-found and error pages use it as the whole page.
 */
export function EmptyState({
  title,
  body,
  icon,
  actions,
  tone = "highlight",
  as: Heading = "h2",
  headingRef,
  className,
}: {
  title: string;
  body?: ReactNode;
  /** Decorative art such as `EmptyStateIcon`; the title carries the meaning. */
  icon?: ReactNode;
  /** Buttons or links, the main one first. At most one red button per screen. */
  actions?: ReactNode;
  tone?: EmptyStateTone;
  /** `h1` when the state is the whole page. */
  as?: "h1" | "h2" | "h3";
  /** Focus the title with this when the state replaces content the user was on. */
  headingRef?: Ref<HTMLHeadingElement>;
  className?: string;
}) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={cx(
        "max-w-xl rounded-card border-[2.5px] border-ink bg-card p-6 shadow-card sm:p-8",
        className,
      )}
    >
      {icon && (
        <div
          aria-hidden="true"
          className={cx(
            "mb-5 grid size-16 -rotate-3 place-items-center rounded-callout border-[2.5px] border-ink text-ink shadow-sticker",
            tones[tone],
          )}
        >
          {icon}
        </div>
      )}
      <Heading
        id={titleId}
        ref={headingRef}
        tabIndex={headingRef ? -1 : undefined}
        className="font-display text-2xl outline-none sm:text-3xl"
      >
        {title}
      </Heading>
      {body && <p className="mt-2 text-ink-secondary">{body}</p>}
      {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
    </section>
  );
}

/**
 * The logo's scanner frame with nothing found inside (a dashed gap, like a
 * missing part) or with a warning mark. Decorative.
 */
export function EmptyStateIcon({
  variant = "empty",
  className,
}: {
  variant?: "empty" | "error";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cx("size-10", className)}
    >
      <path
        d="M3 10V5a2 2 0 0 1 2-2h5M22 3h5a2 2 0 0 1 2 2v5M29 22v5a2 2 0 0 1-2 2h-5M10 29H5a2 2 0 0 1-2-2v-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {variant === "empty" ? (
        <rect
          x="9.5"
          y="9.5"
          width="13"
          height="13"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="3 2.5"
        />
      ) : (
        <>
          <path
            d="M16 9v8.5"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="16" cy="22.5" r="1.9" fill="currentColor" />
        </>
      )}
    </svg>
  );
}
