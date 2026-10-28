import Image from "next/image";
import { DetectionBox } from "@/components/ui/detection-box";
import { cx } from "@/lib/cx";
import type { LabeledBox } from "@/lib/detection-labels";
import type { Photo } from "@/lib/domain";

/** A scan photo with its detection boxes. No grain here: people judge brick colors on it. */
export function DetectedPhoto({
  photo,
  alt,
  detections,
  sizes = "100vw",
  priority = false,
  className,
}: {
  photo: Photo;
  alt: string;
  /** From `labeledBoxes`; at most one is selected. */
  detections: LabeledBox[];
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-callout border-[2.5px] border-ink",
        className,
      )}
    >
      <Image
        src={photo.src}
        width={photo.width}
        height={photo.height}
        alt={alt}
        sizes={sizes}
        priority={priority}
        // Photos people take are stored as data URLs, which can't be optimized.
        unoptimized={photo.src.startsWith("data:")}
        className="block h-auto w-full"
      />
      {detections.map((detection) => (
        <DetectionBox
          key={`${detection.box.x}-${detection.box.y}-${detection.label}`}
          box={detection.box}
          label={detection.label}
          selected={detection.selected}
        />
      ))}
    </div>
  );
}
