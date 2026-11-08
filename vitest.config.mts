import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // Playwright runs the end-to-end specs (`pnpm test:e2e`).
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
