/** The scan flow's steps, in order: take a photo, check the pieces, get ideas. */
export const FLOW_STEPS = ["photo", "pieces", "ideas"] as const;

export type FlowStep = (typeof FLOW_STEPS)[number];

type FlowPosition = {
  /** The step this path belongs to, or null outside the scan flow. */
  current: FlowStep | null;
  /** Links for each step; null for steps not reached yet. */
  hrefs: Record<FlowStep, string | null>;
};

/** Where a localized path such as /en/scan/abc/ideas sits in the scan flow. */
export function flowPosition(pathname: string): FlowPosition {
  const [, locale, section, scanId, sub] = pathname.split("/");
  const photo = `/${locale}/scan`;
  if (section !== "scan") {
    return { current: null, hrefs: { photo, pieces: null, ideas: null } };
  }
  if (!scanId) {
    return { current: "photo", hrefs: { photo, pieces: null, ideas: null } };
  }
  const pieces = `${photo}/${scanId}`;
  if (sub !== "ideas") {
    return { current: "pieces", hrefs: { photo, pieces, ideas: null } };
  }
  return {
    current: "ideas",
    hrefs: { photo, pieces, ideas: `${pieces}/ideas` },
  };
}
