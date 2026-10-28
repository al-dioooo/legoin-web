import type { Photo } from "@/lib/domain";

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

/** Longest side of the stored copy: small enough for localStorage, same as the demo photos. */
const STORED_MAX_SIDE = 1200;

export type PhotoProblem = "type" | "size";

/** Checks a chosen file before reading it. */
export function validatePhoto(
  file: Pick<File, "type" | "size">,
): PhotoProblem | null {
  if (!file.type.startsWith("image/")) return "type";
  if (file.size > MAX_PHOTO_BYTES) return "size";
  return null;
}

/**
 * Reads a photo into a downscaled JPEG data URL, so the mock service can keep it
 * across reloads. Browser only; rejects when the browser can't decode the file.
 */
export async function readPhoto(file: Blob): Promise<Photo> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    STORED_MAX_SIDE / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is not available");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return { src: canvas.toDataURL("image/jpeg", 0.8), width, height };
}
