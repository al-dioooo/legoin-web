import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, test } from "vitest";
import { EmptyState, EmptyStateIcon } from "@/components/ui/empty-state";

test("names its region after the title and shows the way forward", () => {
  render(
    <EmptyState
      title="No scans yet"
      body="Photograph your pieces and your scans will show up here."
      icon={<EmptyStateIcon />}
      actions={<a href="/en/scan">Start a scan</a>}
    />,
  );
  const region = screen.getByRole("region", { name: "No scans yet" });
  expect(
    screen.getByRole("heading", { level: 2, name: "No scans yet" }),
  ).toBeDefined();
  expect(region.textContent).toContain("your scans will show up here");
  expect(
    screen.getByRole("link", { name: "Start a scan" }).getAttribute("href"),
  ).toBe("/en/scan");
});

test("the art is hidden from screen readers", () => {
  const { container } = render(
    <EmptyState title="Nothing here" icon={<EmptyStateIcon />} />,
  );
  const art = container.querySelector("svg")?.closest("[aria-hidden]");
  expect(art?.getAttribute("aria-hidden")).toBe("true");
});

test("a page-level state is the page's h1", () => {
  render(<EmptyState as="h1" title="We couldn't find that page" />);
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "We couldn't find that page",
    }),
  ).toBeDefined();
});

test("the title can take focus when the state replaces content", () => {
  const heading = createRef<HTMLHeadingElement>();
  render(<EmptyState title="Something went wrong" headingRef={heading} />);
  heading.current?.focus();
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { name: "Something went wrong" }),
  );
});
