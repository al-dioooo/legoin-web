import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { ScanResults } from "@/components/results/scan-results";
import { en } from "@/i18n/dictionaries/en";
import { createScan } from "@/lib/api";

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
  // The mock keeps scans in localStorage; empty, it starts from the demo scans.
  localStorage.clear();
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

// The panel's live region speaks the piece when the selection changes; its
// fields would turn every pick into a long read of option lists.
test("announces a newly selected piece, not its form", async () => {
  render(<ScanResults copy={copy} locale="en" />);
  const panel = await screen.findByRole("region", { name: "Selected piece" });
  const live = panel.querySelector<HTMLElement>("[aria-live]");
  if (!live) throw new Error("no live region");
  expect(live.textContent).toContain("Brick 2×2");
  expect(within(live).queryByRole("combobox")).toBeNull();
  expect(within(live).queryByRole("button")).toBeNull();
  expect(within(panel).getAllByRole("combobox")).toHaveLength(2);
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

// Boxes on a busy photo can be smaller than a fingertip; the inventory picks
// the same pieces, and the hint says so before the boxes start.
test("says pieces can be picked in the inventory, and links there", async () => {
  render(<ScanResults copy={copy} locale="en" />);
  const link = await screen.findByRole("link", {
    name: en.results.pick.link,
  });
  const target = document.getElementById(
    link.getAttribute("href")?.slice(1) ?? "",
  );
  expect(target).toBe(screen.getByRole("heading", { name: "Inventory" }));
  // Focusable, so following the link moves focus past the boxes.
  expect(target?.tabIndex).toBe(-1);
  const boxes = screen.getAllByRole("button", { pressed: false });
  expect(
    link.compareDocumentPosition(boxes[0]) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
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

test("a photo with no boxes says the results are a demo", async () => {
  window.history.replaceState(null, "", "/en/scan?mockDelay=0");
  const scan = await createScan({
    src: "data:image/jpeg;base64,AAAA",
    width: 900,
    height: 1200,
  });
  window.history.replaceState(null, "", "/");
  route.id = scan.id;
  render(<ScanResults copy={copy} locale="en" />);
  const note = await screen.findByRole("note");
  expect(note.textContent).toContain(en.results.demo.label);
  expect(screen.getByAltText(en.results.photoAltPlain)).toBeDefined();
  expect(screen.queryByRole("button", { name: "Hide labels" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Zoom in" })).toBeNull();
  expect(screen.getByText(en.results.piece.emptyList)).toBeDefined();
  // The inventory still works: a line selects its piece.
  fireEvent.click(inventoryTile("Brick 2×4"));
  expect(screen.getByText("94%")).toBeDefined();
});

test("demo photos with boxes carry no demo note", async () => {
  render(<ScanResults copy={copy} locale="en" />);
  await screen.findByText("8 pieces");
  expect(screen.queryByRole("note")).toBeNull();
});

test("picking a line far down the inventory brings the piece panel back", async () => {
  render(<ScanResults copy={copy} locale="en" />);
  await screen.findByText("8 pieces");
  const panel = screen.getByRole("region", { name: "Selected piece" });
  const scrollIntoView = vi.fn();
  panel.scrollIntoView = scrollIntoView;

  // In view: nothing moves.
  fireEvent.click(inventoryTile("Plate 2×4"));
  expect(scrollIntoView).not.toHaveBeenCalled();

  // Scrolled away above the list: it comes back.
  panel.getBoundingClientRect = () => ({ top: -400 }) as DOMRect;
  fireEvent.click(inventoryTile("Brick 2×3"));
  expect(scrollIntoView).toHaveBeenCalledWith(
    expect.objectContaining({ block: "start" }),
  );
});
