import Image from "next/image";
import { cx } from "@/lib/cx";
import type { Preview } from "@/lib/domain";

const SIZES = {
  /** On an idea card, small enough that three cards still fit a phone screen. */
  card: "max-w-40",
  /** On the idea page, above the parts. */
  page: "max-w-72",
};

/**
 * A checked build's picture (ADR-0010): an isometric render on a transparent
 * background, set on a paper plate. No grain: people match its bricks to theirs.
 */
export function BuildPreview({
  preview,
  alt,
  size,
  className,
}: {
  preview: Preview;
  alt: string;
  size: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-callout border-2 border-ink bg-page px-4 py-2",
        className,
      )}
    >
      <Image
        src={preview.image}
        width={640}
        height={640}
        alt={alt}
        // Rendered ahead of time at 640 px and versioned, by the web app in the
        // mock and by the API otherwise, so there's nothing to optimize.
        unoptimized
        className={cx("mx-auto block aspect-square h-auto w-full", SIZES[size])}
      />
    </div>
  );
}
