import { cx } from "@/lib/cx";

type MarqueeTone = "ink" | "primary" | "highlight";

const tones: Record<MarqueeTone, string> = {
  ink: "bg-inverse text-highlight",
  primary: "bg-primary text-primary-foreground",
  highlight: "bg-highlight text-highlight-foreground",
};

function Star() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="mx-[0.4em] inline-block size-[0.6em] align-middle"
    >
      <path
        d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * A tape band of words that slides sideways. Two identical copies loop
 * seamlessly; the second is hidden from screen readers. It stops under reduced motion.
 */
export function Marquee({
  words,
  tone = "ink",
  reverse = false,
  className,
}: {
  words: string[];
  tone?: MarqueeTone;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "overflow-hidden border-y-[2.5px] border-ink py-3",
        tones[tone],
        className,
      )}
    >
      <div
        className={cx(
          "flex w-max animate-marquee motion-reduce:animate-none",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {[0, 1].map((copy) => (
          <p
            key={copy}
            aria-hidden={copy === 1 ? true : undefined}
            className="shrink-0 pr-[0.4em] font-display text-[clamp(1.5rem,3.5vw,2.75rem)] leading-none whitespace-nowrap uppercase"
          >
            {/* Each copy repeats the words so it is wider than any screen. */}
            {[0, 1].map((round) =>
              words.map((word) => (
                <span key={`${round}-${word}`}>
                  {word}
                  <Star />
                </span>
              )),
            )}
          </p>
        ))}
      </div>
    </div>
  );
}
