import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { DetectedPhoto } from "@/components/ui/detected-photo";
import { SAMPLE_PHOTO, sampleBoxes } from "@/lib/sample-scan";

const alt = "Six pieces on a white desk";

// A plain photo's alt text already lists its pieces; read out as well, the
// labels would follow it as a run of sizes.
test("a plain photo keeps its labels from screen readers", () => {
  render(
    <DetectedPhoto
      photo={SAMPLE_PHOTO}
      alt={alt}
      detections={sampleBoxes("en")}
    />,
  );
  expect(screen.getByRole("img", { name: alt })).toBeDefined();
  const labels = screen.getAllByText(/×/);
  expect(labels.length).toBeGreaterThan(0);
  for (const label of labels) {
    expect(label.closest("[aria-hidden='true']")).toBe(label);
  }
});

test("boxes that select a piece are named for screen readers", () => {
  const boxes = sampleBoxes("en");
  render(
    <DetectedPhoto
      photo={SAMPLE_PHOTO}
      alt={alt}
      detections={boxes}
      onSelect={() => {}}
    />,
  );
  for (const { name } of boxes) {
    expect(screen.getByRole("button", { name })).toBeDefined();
  }
});
