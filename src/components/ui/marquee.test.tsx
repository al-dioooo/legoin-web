import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Marquee } from "@/components/ui/marquee";

test("screen readers get the words once, not the looping copy", () => {
  const { container } = render(<Marquee words={["Legoin", "Rakit"]} />);
  const copies = container.querySelectorAll("p");
  expect(copies).toHaveLength(2);
  expect(copies[0].getAttribute("aria-hidden")).toBeNull();
  expect(copies[1].getAttribute("aria-hidden")).toBe("true");
  expect(screen.getAllByText("Legoin")).toHaveLength(4);
});
