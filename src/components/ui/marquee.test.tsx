import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Marquee } from "@/components/ui/marquee";
import { TapeBand } from "@/components/ui/tape-band";

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

// WCAG 2.2.2: text that moves by itself for more than five seconds needs a way
// to stop it.
test("a tape band pauses and plays its tapes", () => {
  const { container } = render(
    <TapeBand copy={{ pause: "Pause", play: "Play" }}>
      <Marquee words={["Legoin"]} />
    </TapeBand>,
  );
  const band = container.firstElementChild;
  expect(band?.hasAttribute("data-paused")).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: "Pause" }));
  expect(band?.hasAttribute("data-paused")).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Play" }));
  expect(band?.hasAttribute("data-paused")).toBe(false);
});
