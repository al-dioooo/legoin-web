import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { MAIN_ID, SkipLink } from "@/components/app/skip-link";
import { en } from "@/i18n/dictionaries/en";
import { id } from "@/i18n/dictionaries/id";

test.each([
  ["en", en.app.skip],
  ["id", id.app.skip],
])("in %s it links to the page's main content", (_, label) => {
  render(<SkipLink label={label} />);
  expect(screen.getByRole("link", { name: label }).getAttribute("href")).toBe(
    `#${MAIN_ID}`,
  );
});
