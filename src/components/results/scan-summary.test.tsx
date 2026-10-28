import { render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { ScanSummary } from "@/components/results/scan-summary";
import { en } from "@/i18n/dictionaries/en";
import { resetMockData } from "@/lib/mock/api";

const route = vi.hoisted(() => ({ id: "demo-evening" }));
vi.mock("next/navigation", () => ({ useParams: () => ({ id: route.id }) }));

const copy = { results: en.results, common: en.common };

beforeEach(() => {
  resetMockData();
});

test("shows a demo scan's photo, piece count and inventory", async () => {
  route.id = "demo-evening";
  render(<ScanSummary copy={copy} locale="en" />);
  expect(
    await screen.findByRole("heading", { name: "Your pieces" }),
  ).toBeDefined();
  expect(screen.getByText("8 pieces")).toBeDefined();
  expect(screen.getByAltText(en.results.photoAlt)).toBeDefined();
  expect(screen.getAllByRole("listitem")).toHaveLength(8);
});

test("an unknown scan id offers a new scan", async () => {
  route.id = "nope";
  render(<ScanSummary copy={copy} locale="en" />);
  const action = await screen.findByRole("link", { name: "Start a new scan" });
  expect(action.getAttribute("href")).toBe("/en/scan");
});
