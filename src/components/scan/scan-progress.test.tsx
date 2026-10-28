import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { ScanProgress } from "@/components/scan/scan-progress";
import { en } from "@/i18n/dictionaries/en";

const photo = { src: "/contoh/kepingan-2.jpg", width: 1200, height: 800 };

function show(elapsedSeconds: number) {
  render(
    <ScanProgress
      photo={photo}
      stage="coloring"
      elapsedSeconds={elapsedSeconds}
      copy={en.scan.progress}
      onCancel={vi.fn()}
    />,
  );
}

test("shows the elapsed time as minutes and seconds", () => {
  show(7);
  expect(screen.getByText("0:07")).toBeDefined();
  expect(screen.queryByText(en.scan.progress.slow)).toBeNull();
});

test("after 15 seconds it says the scan is taking longer", () => {
  show(16);
  expect(screen.getByText(en.scan.progress.slow)).toBeDefined();
});

test("the current stage is announced and takes focus", () => {
  show(1);
  expect(
    screen.getByText("Reading colors", { selector: ".sr-only" }),
  ).toBeDefined();
  expect(document.activeElement?.textContent).toBe(en.scan.progress.title);
});
