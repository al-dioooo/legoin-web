import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { CaptureFlow } from "@/components/scan/capture-flow";
import { en } from "@/i18n/dictionaries/en";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const api = vi.hoisted(() => {
  class MockApiError extends Error {
    constructor(readonly reason: string) {
      super(reason);
    }
  }
  return { createScan: vi.fn(), MockApiError };
});
vi.mock("@/lib/mock/api", () => ({
  createScan: api.createScan,
  MockApiError: api.MockApiError,
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

const copy = {
  capture: en.scan.capture,
  errors: en.scan.errors,
  progress: en.scan.progress,
  failures: en.scan.failures,
};

function pick(file: File) {
  const input = document.querySelector<HTMLInputElement>(
    'input[type="file"]:not([capture])',
  );
  if (!input) throw new Error("file input missing");
  fireEvent.change(input, { target: { files: [file] } });
}

function scanSample() {
  render(<CaptureFlow copy={copy} locale="en" />);
  fireEvent.click(screen.getByRole("button", { name: "Try the sample photo" }));
  fireEvent.click(screen.getByRole("button", { name: "Scan pieces" }));
}

beforeEach(() => {
  push.mockReset();
  api.createScan.mockReset();
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
  api.createScan.mockResolvedValue({ id: "abc" });
  scanSample();
  await waitFor(() => expect(push).toHaveBeenCalledWith("/en/scan/abc"));
  expect(api.createScan.mock.calls[0][0]).toMatchObject({
    src: "/contoh/kepingan-2.jpg",
  });
});

test("progress follows the stages, and cancel returns to the preview", async () => {
  let signal: AbortSignal | undefined;
  api.createScan.mockImplementation((_photo, options) => {
    signal = options.signal;
    options.onStage("detecting");
    options.onStage("classifying");
    return new Promise(() => {});
  });
  scanSample();
  expect(
    await screen.findByRole("heading", { name: "Scanning your pieces" }),
  ).toBeDefined();
  const stages = screen
    .getAllByRole("listitem")
    .map((item) => item.textContent);
  expect(stages).toEqual([
    "Finding pieces(done)",
    "Recognizing parts(in progress)",
    "Reading colors(waiting)",
  ]);
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(signal?.aborted).toBe(true);
  expect(screen.getByRole("button", { name: "Scan pieces" })).toBeDefined();
});

test("a photo problem asks for a new photo", async () => {
  api.createScan.mockRejectedValue(new api.MockApiError("too_dark"));
  scanSample();
  expect(
    await screen.findByRole("heading", {
      name: en.scan.failures.too_dark.title,
    }),
  ).toBeDefined();
  expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Retake photo" }));
  expect(screen.getByRole("button", { name: "Take a photo" })).toBeDefined();
});

test("a dropped connection can be retried with the same photo", async () => {
  api.createScan
    .mockRejectedValueOnce(new api.MockApiError("network"))
    .mockResolvedValueOnce({ id: "retried" });
  scanSample();
  fireEvent.click(await screen.findByRole("button", { name: "Try again" }));
  await waitFor(() => expect(push).toHaveBeenCalledWith("/en/scan/retried"));
  expect(api.createScan).toHaveBeenCalledTimes(2);
});

test("an unexpected error keeps the photo and says so", async () => {
  api.createScan.mockRejectedValue(new Error("boom"));
  scanSample();
  expect((await screen.findByRole("alert")).textContent).toBe(
    en.scan.errors.generic,
  );
  expect(screen.getByAltText(en.scan.capture.sampleAlt)).toBeDefined();
});
