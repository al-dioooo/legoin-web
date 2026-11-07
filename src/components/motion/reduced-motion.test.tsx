import { render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import {
  MotionPreview,
  useReducedMotion,
} from "@/components/motion/reduced-motion";

function Probe() {
  return <p>{useReducedMotion() ? "reduced" : "full"}</p>;
}

function systemSetting(reduce: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduce && query === "(prefers-reduced-motion: reduce)",
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test("follows the system setting", () => {
  systemSetting(true);
  render(<Probe />);
  expect(screen.getByText("reduced")).toBeDefined();
});

test("full motion when the system has no preference", () => {
  systemSetting(false);
  render(<Probe />);
  expect(screen.getByText("full")).toBeDefined();
});

test("a preview overrides the system setting both ways", () => {
  systemSetting(false);
  const { unmount } = render(
    <MotionPreview reduced>
      <Probe />
    </MotionPreview>,
  );
  expect(screen.getByText("reduced")).toBeDefined();
  unmount();

  systemSetting(true);
  render(
    <MotionPreview reduced={false}>
      <Probe />
    </MotionPreview>,
  );
  expect(screen.getByText("full")).toBeDefined();
});

test("works where matchMedia is missing", () => {
  render(<Probe />);
  expect(screen.getByText("full")).toBeDefined();
});
