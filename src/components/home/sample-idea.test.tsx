import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { SampleIdea } from "@/components/home/sample-idea";
import { en } from "@/i18n/dictionaries/en";
import { id } from "@/i18n/dictionaries/id";

function details(container: HTMLElement) {
  const element = container.querySelector("details");
  if (!element) throw new Error("no disclosure");
  return element;
}

test("shows the idea and keeps its steps closed until asked", () => {
  const { container } = render(
    <SampleIdea copy={{ sample: en.sample, common: en.common }} locale="en" />,
  );
  expect(
    screen.getByRole("heading", { name: "Little race car" }),
  ).toBeDefined();
  expect(screen.getByText("3 parts missing")).toBeDefined();
  expect(details(container).open).toBe(false);
  // No link out: the steps open on the page itself.
  expect(screen.queryByRole("link")).toBeNull();

  fireEvent.click(screen.getByText("See the steps"));
  expect(details(container).open).toBe(true);
});

test("lists the parts used and missing, and the numbered steps", () => {
  const { container } = render(
    <SampleIdea copy={{ sample: en.sample, common: en.common }} locale="en" />,
  );
  const disclosure = details(container);
  expect(
    within(disclosure).getByRole("region", { name: "Parts used" }),
  ).toBeDefined();
  const missing = within(disclosure).getByRole("region", {
    name: "Parts missing",
  });
  expect(missing.textContent).toContain("Round 1×1");

  const steps = within(disclosure)
    .getAllByRole("listitem")
    .filter((item) => item.closest("ol"));
  expect(steps.map((step) => step.textContent)).toEqual(
    en.sample.idea.steps.map((text, index) => `Step ${index + 1}${text}`),
  );
});

test("reads in Indonesian", () => {
  render(
    <SampleIdea copy={{ sample: id.sample, common: id.common }} locale="id" />,
  );
  expect(
    screen.getByRole("heading", { name: "Mobil balap kecil" }),
  ).toBeDefined();
  expect(screen.getByText("Kurang 3 part")).toBeDefined();
  expect(screen.getByText("Lihat langkah")).toBeDefined();
});
