import Image from "next/image";
import { DetectionBox, type LabelMode } from "@/components/ui/detection-box";
import { cx } from "@/lib/cx";
import type { LabeledBox } from "@/lib/detection-labels";
import type { Photo } from "@/lib/domain";
import { staggerIndex } from "@/lib/motion";

/**
 * Which labels to draw: every one; "auto", only the selected piece's on phones
 * so labels never collide; or none, for busy photos.
 */
export type PhotoLabels = "all" | "auto" | "none";

function labelMode(labels: PhotoLabels, selected: boolean): LabelMode {
  if (labels === "none") return "never";
  if (labels === "auto" && !selected) return "wide";
  return "always";
}

/**
 * A scan photo with its detection boxes, which click in one after another. No
 * grain here: people judge brick colors on it.
 */
export function DetectedPhoto({
  photo,
  alt,
  detections,
  labels = "all",
  onSelect,
  assembling = true,
  leavingId,
  priority = false,
  className,
}: {
  photo: Photo;
  alt: string;
  /** From `labeledBoxes`; at most one is selected. */
  detections: LabeledBox[];
  labels?: PhotoLabels;
  /** Makes each box a button that selects its piece. */
  onSelect?: (id: string) => void;
  /** Boxes click in one after another; turn off once they're in, so later ones arrive at once. */
  assembling?: boolean;
  /** The piece being removed, which pops off. */
  leavingId?: string;
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
        priority={priority}
        // Scan photos are stored already downscaled to 1200 px (people's own
        // as data URLs), so there's nothing to optimize, and every view of a
        // photo reuses the same URL.
        unoptimized
        className="block h-auto w-full"
      />
      {detections.map((detection, index) => (
        <DetectionBox
          key={detection.id}
          box={detection.box}
          label={detection.label}
          name={detection.name}
          selected={detection.selected}
          flagged={detection.flagged}
          labelMode={labelMode(labels, detection.selected)}
          order={assembling ? staggerIndex(index) : undefined}
          leaving={detection.id === leavingId}
          onSelect={onSelect ? () => onSelect(detection.id) : undefined}
        />
      ))}
    </div>
  );
}
