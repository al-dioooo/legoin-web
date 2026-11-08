// @vitest-environment node
import { globSync, readFileSync } from "node:fs";
import { expect, test } from "vitest";

const source = (file: string) => readFileSync(file, "utf8");
const files = globSync("src/{app,components}/**/*.tsx").filter(
  (file) => !file.includes(".test."),
);

// The skip link jumps to `#main`, so every page's main element has to be it.
// Pages bring their own (home, /desain) or get one from a layout.
test("every <main> is the skip link's target", () => {
  const mains = files.flatMap((file) =>
    [...source(file).matchAll(/<main\b[^>]*>/g)].map((match) => ({
      file,
      tag: match[0],
    })),
  );
  expect(mains.length).toBeGreaterThan(0);
  for (const { file, tag } of mains) {
    expect(tag, file).toContain("id={MAIN_ID}");
    // Focusable from the link, so screen readers start reading there.
    expect(tag, file).toContain("tabIndex={-1}");
  }
});

// Every page renders under the root layout, except the last-resort error page,
// which replaces it.
test("the root layout and global-error render the skip link first", () => {
  const rendering = files.filter((file) => /<SkipLink\b/.test(source(file)));
  expect(rendering.sort()).toEqual([
    "src/app/[lang]/layout.tsx",
    "src/app/global-error.tsx",
  ]);
  for (const file of rendering) {
    const body = source(file).split(/<body\b/)[1] ?? "";
    expect(body.indexOf("<SkipLink"), file).toBeLessThan(
      body.indexOf("baseplate"),
    );
  }
});
