import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { ScanResults } from "@/components/results/scan-results";
import { en } from "@/i18n/dictionaries/en";
import { resetMockData } from "@/lib/mock/api";

const route = vi.hoisted(() => ({ id: "demo-evening" }));
vi.mock("next/navigation", () => ({ useParams: () => ({ id: route.id }) }));

const copy = { results: en.results, common: en.common };

function inventoryTile(part: string) {
  const region = screen.getByRole("region", { name: "Inventory" });
  const tile = within(within(region).getByRole("list"))
    .getAllByRole("button")
    .find((button) => button.textContent?.includes(part));
  if (!tile) throw new Error(`no tile for ${part}`);
  return tile;
}

beforeEach(() => {
  resetMockData();
  route.id = "demo-evening";
});

test("shows the photo, piece count and inventory", async () => {
  render(<ScanResults copy={copy} locale="en" />);
  expect(
    await screen.findByRole("heading", { name: "Your pieces" }),
  ).toBeDefined();
  expect(screen.getByText("8 pieces")).toBeDefined();
  expect(screen.getByAltText(en.results.photoAlt)).toBeDefined();
});

test("starts on the piece to check and flags it", async () => {
  render(<ScanResults copy={copy} locale="en" />);
  expect(await screen.findByText("1 piece to check")).toBeDefined();
  const box = screen.getByRole("button", { name: "Brick 2×2, dark gray, 58%" });
  expect(box.getAttribute("aria-pressed")).toBe("true");
  expect(screen.getByText(en.results.piece.lowConfidence)).toBeDefined();
  expect(inventoryTile("Brick 2×2").getAttribute("aria-pressed")).toBe("true");
});

test("selecting a box highlights its inventory line", async () => {
  render(<ScanResults copy={copy} locale="en" />);
  fireEvent.click(
    await screen.findByRole("button", { name: "Brick 2×3, blue, 93%" }),
  );
  expect(inventoryTile("Brick 2×3").getAttribute("aria-pressed")).toBe("true");
  expect(inventoryTile("Brick 2×2").getAttribute("aria-pressed")).toBe("false");
  expect(screen.getByText("93%")).toBeDefined();
});

test("selecting an inventory line selects its box", async () => {
  render(<ScanResults copy={copy} locale="en" />);
  await screen.findByText("8 pieces");
  fireEvent.click(inventoryTile("Plate 2×4"));
  expect(
    screen
      .getByRole("button", { name: "Plate 2×4, black, 92%" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
});

test("labels can be hidden for busy photos", async () => {
  render(<ScanResults copy={copy} locale="en" />);
  await screen.findByText("8 pieces");
  expect(screen.getByText("2×3")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Hide labels" }));
  expect(screen.queryByText("2×3")).toBeNull();
  expect(screen.getByRole("button", { name: "Show labels" })).toBeDefined();
});

test("an unknown scan id offers a new scan", async () => {
  route.id = "nope";
  render(<ScanResults copy={copy} locale="en" />);
  const action = await screen.findByRole("link", { name: "Start a new scan" });
  expect(action.getAttribute("href")).toBe("/en/scan");
});
