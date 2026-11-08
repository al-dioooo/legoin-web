import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Marquee } from "@/components/ui/marquee";

test("screen readers get the words once, in order, not the moving copies", () => {
  const { container } = render(<Marquee words={["Legoin", "Rakit"]} />);
  expect(screen.getByText("Legoin, Rakit").className).toContain("sr-only");
  const track = container.querySelector(".animate-marquee");
  expect(track?.getAttribute("aria-hidden")).toBe("true");
  // Two copies, each repeating the words, so the loop is seamless.
  expect(track?.querySelectorAll("p")).toHaveLength(2);
  expect(screen.getAllByText("Legoin")).toHaveLength(4);
});

test("a decorative tape has nothing to read", () => {
  render(<Marquee words={["Legoin", "Rakit"]} decorative />);
  expect(screen.queryByText("Legoin, Rakit")).toBeNull();
});
