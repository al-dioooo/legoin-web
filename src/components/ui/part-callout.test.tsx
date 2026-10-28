import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { PartCallout } from "@/components/ui/part-callout";
import type { PartCount } from "@/lib/bricks";

const parts: PartCount[] = [
  { part: "brick-2x4", color: "red", quantity: 2 },
  { part: "slope-2x2", color: "yellow", quantity: 1 },
];

test("each part is announced as quantity, part and color", () => {
  render(
    <PartCallout title="Parts missing" parts={parts} locale="en" missing />,
  );
  const callout = screen.getByRole("region", { name: "Parts missing" });
  expect(within(callout).getAllByRole("listitem")).toHaveLength(2);
  expect(within(callout).getByText("2× Brick 2×4 red")).toBeDefined();
  expect(within(callout).getByText("1× Slope 45° 2×2 yellow")).toBeDefined();
});

test("color names follow the language", () => {
  render(<PartCallout title="Part kurang" parts={parts} locale="id" />);
  const callout = screen.getByRole("region", { name: "Part kurang" });
  expect(within(callout).getByText("2× Brick 2×4 merah")).toBeDefined();
});
