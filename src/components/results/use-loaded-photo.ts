import { useEffect, useState } from "react";
import type { Photo } from "@/lib/domain";

/**
 * The photo to draw: `standIn`, a copy that's already on screen, until `photo`
 * has loaded, then `photo`. Straight from the scanner that keeps the local
 * copy in place while the API's copy loads, so the photo morph (ADR-0006)
 * lands on a drawn image and nothing flashes when the source changes. If the
 * API's copy never loads, the stand-in stays.
 */
export function useLoadedPhoto(
  photo: Photo | null,
  standIn: Photo | null,
): Photo | null {
  const [loaded, setLoaded] = useState<string | null>(null);
  const src = photo?.src;
  const waiting =
    src !== undefined &&
    standIn !== null &&
    standIn.src !== src &&
    loaded !== src;

  useEffect(() => {
    if (!waiting || src === undefined) return;
    let active = true;
    const image = new Image();
    image.src = src;
    image.decode().then(
      () => {
        if (active) setLoaded(src);
      },
      () => {
        // Keep the stand-in rather than draw a broken image.
      },
    );
    return () => {
      active = false;
    };
  }, [waiting, src]);

  return waiting ? standIn : photo;
}
