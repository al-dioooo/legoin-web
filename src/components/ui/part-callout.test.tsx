import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { PartCallout } from "@/components/ui/part-callout";

test("each part is announced as quantity, part and color", () => {
  render(
    <PartCallout
      title="Part kurang"
      missing
      parts={[
        { part: "brick-2x4", color: "red", quantity: 2 },
        { part: "slope-2x2", color: "yellow", quantity: 1 },
      ]}
    />,
  );
  const callout = screen.getByRole("region", { name: "Part kurang" });
  expect(within(callout).getAllByRole("listitem")).toHaveLength(2);
  expect(within(callout).getByText("2× Brick 2×4 merah")).toBeDefined();
  expect(within(callout).getByText("1× Slope 45° 2×2 kuning")).toBeDefined();
});
