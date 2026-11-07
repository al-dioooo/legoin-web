import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { MotionShowcase, ReducedMotionSwitch } from "@/components/motion/demos";

test("every reduced-motion switch on the page drives one preview", () => {
  const { container } = render(
    <MotionShowcase>
      <ReducedMotionSwitch label="Preview reduced motion" />
      <p>Section</p>
      <ReducedMotionSwitch label="Preview reduced motion" />
    </MotionShowcase>,
  );
  const [first, second] = screen.getAllByRole("button", {
    name: "Preview reduced motion",
  });
  expect(first.getAttribute("aria-pressed")).toBe("false");

  fireEvent.click(second);
  expect(first.getAttribute("aria-pressed")).toBe("true");
  expect(second.getAttribute("aria-pressed")).toBe("true");
  expect(
    container.querySelector("[data-motion]")?.getAttribute("data-motion"),
  ).toBe("reduce");

  fireEvent.click(first);
  expect(second.getAttribute("aria-pressed")).toBe("false");
  expect(container.querySelector("[data-motion]")).toBeNull();
});
