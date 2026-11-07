import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Count, Odometer } from "@/components/motion/odometer";

const pieces = { one: "{count} piece", other: "{count} pieces" };

function wheels(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>(".odometer-digit")].map(
    (wheel) => wheel.style.getPropertyValue("--d"),
  );
}

test("each digit gets a wheel turned to it, hidden from screen readers", () => {
  const { container } = render(<Odometer value={108} />);
  expect(wheels(container)).toEqual(["1", "0", "8"]);
  expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
});

test("the ones wheel stays mounted when the count gains a digit", () => {
  const { container, rerender } = render(<Odometer value={9} />);
  const ones = container.querySelector(".odometer-digit");
  rerender(<Odometer value={10} />);
  const after = container.querySelectorAll(".odometer-digit");
  expect(wheels(container)).toEqual(["1", "0"]);
  expect(after[1]).toBe(ones);
});

test("a count reads as one plain sentence", () => {
  render(<Count message={pieces} count={8} locale="en" as="p" />);
  const sentence = screen.getByText("8 pieces");
  expect(sentence.tagName).toBe("P");
  expect(sentence.className).toBe("sr-only");
  expect(sentence.nextElementSibling?.getAttribute("aria-hidden")).toBe("true");
  expect(sentence.nextElementSibling?.textContent).toBe("8 pieces");
});
