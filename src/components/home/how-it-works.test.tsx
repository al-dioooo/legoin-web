import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { HowItWorks } from "@/components/home/how-it-works";
import { en } from "@/i18n/dictionaries/en";
import { id } from "@/i18n/dictionaries/id";

test("walks through photo, pieces and ideas in order", () => {
  render(
    <HowItWorks
      copy={{ how: en.home.how, steps: en.app.steps, step: en.common.step }}
    />,
  );
  expect(screen.getByRole("heading", { name: "How it works" })).toBeDefined();
  const steps = screen.getAllByRole("listitem");
  expect(steps).toHaveLength(3);
  expect(steps.map((step) => step.querySelector("h3")?.textContent)).toEqual([
    "Photo",
    "Pieces",
    "Ideas",
  ]);
  // Each number says "Step" to screen readers; the arrows between stay silent.
  expect(steps[0].textContent).toContain("Step 1");
  expect(steps[2].textContent).toContain(en.home.how.ideas);
});

test("uses the app's step names in Indonesian", () => {
  render(
    <HowItWorks
      copy={{ how: id.home.how, steps: id.app.steps, step: id.common.step }}
    />,
  );
  expect(screen.getByRole("heading", { name: "Cara kerjanya" })).toBeDefined();
  expect(
    screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
  ).toEqual(["Foto", "Kepingan", "Ide"]);
});
