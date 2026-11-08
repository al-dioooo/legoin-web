import { connection } from "next/server";
import { Suspense } from "react";

async function Connection() {
  await connection();
  return null;
}

/**
 * Render this on every page whose `generateMetadata` reads `params`, such as a
 * scan page passing its id to `languageAlternates()`. The id is only known at
 * request time, so the metadata streams in then; this marker renders nothing
 * and tells Next that's on purpose, while the rest of the page stays a static
 * shell. Without it, dev reports "Next.js encountered URL data in
 * `generateMetadata()`". See "With Cache Components" in the `generateMetadata`
 * docs under `node_modules/next/dist/docs`.
 */
export function UrlMetadataMarker() {
  return (
    <Suspense>
      <Connection />
    </Suspense>
  );
}
