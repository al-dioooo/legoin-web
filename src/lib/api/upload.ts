/* The photo `createScan` gets, as the bytes the API's upload takes: a
 * multipart part named `photo` (POST /scan-jobs). The capture flow passes the
 * copy on screen, a data URL for the person's own photo (`readPhoto` makes a
 * JPEG) or a path on this site for the sample photo.
 */
import { ApiError } from "@/lib/api/error";
import type { Photo } from "@/lib/domain";

const BASE64_DATA_URL = /^data:([^,;]*)[^,]*;base64,/;

const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * The photo's bytes. A data URL is decoded here; anything else, such as the
 * sample photo's path, is fetched. A photo that can't be fetched rejects with
 * `network`; aborting through `signal` rejects with its reason.
 */
export async function photoBlob(
  photo: Photo,
  { fetch: send, signal }: { fetch: typeof fetch; signal?: AbortSignal },
): Promise<Blob> {
  const dataUrl = BASE64_DATA_URL.exec(photo.src);
  if (dataUrl) {
    const text = atob(photo.src.slice(dataUrl[0].length));
    const bytes = Uint8Array.from(text, (char) => char.charCodeAt(0));
    return new Blob([bytes], { type: dataUrl[1] });
  }
  try {
    const response = await send(photo.src, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.blob();
  } catch {
    signal?.throwIfAborted();
    throw new ApiError("network");
  }
}

/** The part's file name, like the contract's example `photo.jpg`. */
export function photoFileName(photo: Blob) {
  return `photo.${EXTENSIONS[photo.type] ?? "jpg"}`;
}
