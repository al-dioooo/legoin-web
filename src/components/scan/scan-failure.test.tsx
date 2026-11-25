import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { ScanFailureView } from "@/components/scan/scan-failure";
import { en } from "@/i18n/dictionaries/en";
import { id } from "@/i18n/dictionaries/id";
import { SCAN_FAILURES } from "@/lib/domain";

function show(reason: (typeof SCAN_FAILURES)[number], copy = en.scan.failures) {
  const onRetry = vi.fn();
  const onRetake = vi.fn();
  render(
    <ScanFailureView
      reason={reason}
      copy={copy}
      onRetry={onRetry}
      onRetake={onRetake}
    />,
  );
  return { onRetry, onRetake };
}

test("every failure has its own message in both languages", () => {
  for (const copy of [en.scan.failures, id.scan.failures]) {
    const titles = SCAN_FAILURES.map((reason) => copy[reason].title);
    expect(new Set(titles).size).toBe(SCAN_FAILURES.length);
  }
});

test("a timeout keeps the photo, so the same scan can run again", () => {
  const { onRetry, onRetake } = show("timeout");
  expect(
    screen.getByRole("heading", { name: en.scan.failures.timeout.title }),
  ).toBeDefined();
  expect(screen.getByText(en.scan.failures.timeout.body)).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: en.scan.failures.retry }));
  expect(onRetry).toHaveBeenCalledOnce();
  fireEvent.click(
    screen.getByRole("button", { name: en.scan.failures.retake }),
  );
  expect(onRetake).toHaveBeenCalledOnce();
});

test("a problem with the photo only offers a new one", () => {
  show("too_blurry");
  expect(
    screen.queryByRole("button", { name: en.scan.failures.retry }),
  ).toBeNull();
  expect(
    screen.getByRole("button", { name: en.scan.failures.retake }),
  ).toBeDefined();
});
