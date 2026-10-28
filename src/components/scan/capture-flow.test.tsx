import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { CaptureFlow } from "@/components/scan/capture-flow";
import { en } from "@/i18n/dictionaries/en";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const createScan = vi.fn();
vi.mock("@/lib/mock/api", () => ({
  createScan: (...args: unknown[]) => createScan(...args),
  mockOptionsFromSearch: () => ({}),
}));

// jsdom can't decode images; reading a valid file yields a fixed photo.
vi.mock("@/lib/photo", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/photo")>()),
  readPhoto: async () => ({
    src: "data:image/jpeg;base64,AA==",
    width: 4,
    height: 3,
  }),
}));

const copy = { capture: en.scan.capture, errors: en.scan.errors };

function pick(file: File) {
  const input = document.querySelector<HTMLInputElement>(
    'input[type="file"]:not([capture])',
  );
  if (!input) throw new Error("file input missing");
  fireEvent.change(input, { target: { files: [file] } });
}

beforeEach(() => {
  push.mockReset();
  createScan.mockReset();
});

test("a file that isn't an image shows an inline error", async () => {
  render(<CaptureFlow copy={copy} locale="en" />);
  pick(new File(["%PDF"], "notes.pdf", { type: "application/pdf" }));
  expect((await screen.findByRole("alert")).textContent).toBe(
    en.scan.errors.type,
  );
  expect(screen.queryByRole("button", { name: "Scan pieces" })).toBeNull();
});

test("a chosen photo shows a preview, and retake goes back", async () => {
  render(<CaptureFlow copy={copy} locale="en" />);
  pick(new File(["jpg"], "bricks.jpg", { type: "image/jpeg" }));
  expect(await screen.findByAltText(en.scan.capture.previewAlt)).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Retake" }));
  expect(screen.getByRole("button", { name: "Take a photo" })).toBeDefined();
});

test("the sample photo scans and opens the results", async () => {
  createScan.mockResolvedValue({ id: "abc" });
  render(<CaptureFlow copy={copy} locale="en" />);
  fireEvent.click(screen.getByRole("button", { name: "Try the sample photo" }));
  expect(screen.getByAltText(en.scan.capture.sampleAlt)).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Scan pieces" }));
  await waitFor(() => expect(push).toHaveBeenCalledWith("/en/scan/abc"));
  expect(createScan.mock.calls[0][0]).toMatchObject({
    src: "/contoh/kepingan-2.jpg",
  });
});

test("a failed scan keeps the photo and says so", async () => {
  createScan.mockRejectedValue(new Error("boom"));
  render(<CaptureFlow copy={copy} locale="en" />);
  fireEvent.click(screen.getByRole("button", { name: "Try the sample photo" }));
  fireEvent.click(screen.getByRole("button", { name: "Scan pieces" }));
  expect((await screen.findByRole("alert")).textContent).toBe(
    en.scan.errors.generic,
  );
  expect(screen.getByAltText(en.scan.capture.sampleAlt)).toBeDefined();
});
