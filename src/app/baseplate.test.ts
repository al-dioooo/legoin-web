// @vitest-environment node
import { globSync, readFileSync } from "node:fs";
import { expect, test } from "vitest";

/** A `baseplate` class or `<StudGlow />` in a className or JSX. */
const DRAWS_BASEPLATE = /className=[^>]*?\bbaseplate\b|<StudGlow\b/;

test("the guard spots a baseplate", () => {
  expect('<div className="baseplate flex">').toMatch(DRAWS_BASEPLATE);
  expect('<div className={cx("flex baseplate")}>').toMatch(DRAWS_BASEPLATE);
  expect("<StudGlow />").toMatch(DRAWS_BASEPLATE);
  expect('<section id="baseplate">').not.toMatch(DRAWS_BASEPLATE);
  expect("/** No plate, so the baseplate shows through. */").not.toMatch(
    DRAWS_BASEPLATE,
  );
});

// Every page sits on the root layout's baseplate (ADR-0006). A second one
// inside it would draw the studs twice, out of step, with two pointer glows.
// global-error.tsx replaces the root layout, so it draws its own.
test("the baseplate is drawn by the root layout only", () => {
  const files = globSync("src/{app,components}/**/*.tsx").filter(
    (file) => !file.includes(".test."),
  );
  const drawing = files.filter((file) =>
    DRAWS_BASEPLATE.test(readFileSync(file, "utf8")),
  );
  expect(drawing.sort()).toEqual([
    "src/app/[lang]/layout.tsx",
    "src/app/global-error.tsx",
  ]);
});
