import { notFound } from "next/navigation";

// This segment never renders content, so there's no navigation to check for
// instant UI; without this, dev reports it can't validate the route.
export const instant = false;

/**
 * The root layout sits under `[lang]`, so Next has no root not-found for
 * unmatched URLs. Catching every other path under a language, such as /en/foo,
 * sends it to the localized `[lang]/not-found.tsx` instead of Next's default.
 */
export default function UnknownPath() {
  notFound();
}
