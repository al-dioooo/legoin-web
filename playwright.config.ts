import { defineConfig, devices } from "@playwright/test";

/* End-to-end smoke tests (ADR-0007 in legoin-docs): Chromium only, at a phone
 * width and a desktop width, against a production build. Vitest stays the
 * main safety net; see AGENTS.md for what belongs here.
 */

const CI = Boolean(process.env.CI);
// Out of the way of `pnpm dev` on 3000, so a dev server is never tested by mistake.
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: CI,
  // One retry in CI records a trace, but a test that only passes on its retry
  // still fails the run: against the mock, flakiness is a bug.
  retries: CI ? 1 : 0,
  failOnFlakyTests: CI,
  reporter: CI
    ? [["github"], ["list"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  // Every test gets a fresh context, so it starts with empty storage and only
  // the mock's demo scans.
  projects: [
    {
      name: "phone",
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 360, height: 780 },
      },
    },
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: {
    // CI builds in a step of its own. Locally the run builds first, and never
    // reuses a server already on the port, so it can't test a stale build.
    command: CI
      ? `pnpm start --port ${PORT}`
      : `pnpm build && pnpm start --port ${PORT}`,
    url: `http://localhost:${PORT}/en`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: { NEXT_TELEMETRY_DISABLED: "1" },
  },
});
