import Image from "next/image";
import { type Box, DetectionBox } from "@/components/ui/detection-box";
import { cx } from "@/lib/cx";

type Photo = { src: string; width: number; height: number; alt: string };

/** A scan photo with its detection boxes. No grain here: people judge brick colors on it. */
export function DetectedPhoto({
  photo,
  detections,
  selected,
  sizes = "100vw",
  priority = false,
  className,
}: {
  photo: Photo;
  detections: { box: Box; label: string }[];
  /** Index of the highlighted detection, if any. */
  selected?: number;
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
        alt={photo.alt}
        sizes={sizes}
        priority={priority}
        className="block h-auto w-full"
      />
      {detections.map((detection, index) => (
        <DetectionBox
          key={`${detection.label}-${detection.box.x}-${detection.box.y}`}
          box={detection.box}
          label={detection.label}
          selected={index === selected}
        />
      ))}
    </div>
  );
}
