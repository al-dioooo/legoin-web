import type { PartCount } from "@/lib/bricks";
import type { Detection, DetectionChange } from "@/lib/domain";

const key = ({ part, color }: Pick<PartCount, "part" | "color">) =>
  `${part}|${color}`;

/** Adds up lines with the same part and color. Biggest groups first. */
function merge(lines: PartCount[]): PartCount[] {
  const totals = new Map<string, PartCount>();
  for (const line of lines) {
    const existing = totals.get(key(line));
    totals.set(
      key(line),
      existing
        ? { ...existing, quantity: existing.quantity + line.quantity }
        : { ...line },
    );
  }
  return [...totals.values()]
    .filter((line) => line.quantity > 0)
    .sort(
      (a, b) =>
        b.quantity - a.quantity ||
        a.part.localeCompare(b.part) ||
        a.color.localeCompare(b.color),
    );
}

/** The inventory: detections grouped by part × color. */
export function toInventory(
  detections: Pick<Detection, "part" | "color">[],
): PartCount[] {
  return merge(
    detections.map(({ part, color }) => ({ part, color, quantity: 1 })),
  );
}

/** Applies corrections in order. Added pieces get one detection each, with no box. */
export function applyChanges(
  detections: Detection[],
  changes: DetectionChange[],
  newId: () => string,
): Detection[] {
  let result = detections;
  for (const change of changes) {
    if (change.type === "remove") {
      result = result.filter((detection) => detection.id !== change.id);
    } else if (change.type === "edit") {
      result = result.map((detection) =>
        detection.id === change.id
          ? {
              ...detection,
              part: change.part ?? detection.part,
              color: change.color ?? detection.color,
              edited: true,
            }
          : detection,
      );
    } else {
      const added = Array.from({ length: change.quantity }, () => ({
        id: newId(),
        part: change.part,
        color: change.color,
        box: null,
        confidence: null,
        edited: true,
      }));
      result = [...result, ...added];
    }
  }
  return result;
}

/**
 * Splits what a build needs into parts the inventory covers and parts that are
 * missing: the PRD's cek_inventori check. A missing part is never counted as owned.
 */
export function checkInventory(
  required: PartCount[],
  inventory: PartCount[],
): { used: PartCount[]; missing: PartCount[] } {
  const available = new Map(
    merge(inventory).map((line) => [key(line), line.quantity]),
  );
  const used: PartCount[] = [];
  const missing: PartCount[] = [];
  for (const line of merge(required)) {
    const owned = Math.min(line.quantity, available.get(key(line)) ?? 0);
    if (owned > 0) used.push({ ...line, quantity: owned });
    if (line.quantity > owned) {
      missing.push({ ...line, quantity: line.quantity - owned });
    }
  }
  return { used, missing };
}
