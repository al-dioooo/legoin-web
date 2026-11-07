import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { ScanResults } from "@/components/results/scan-results";
import { en } from "@/i18n/dictionaries/en";
import { getScan, resetMockData } from "@/lib/mock/api";
import { forgetHandedOffScan, handOffScan } from "@/lib/scan-handoff";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "demo-evening" }),
}));

const copy = { results: en.results, common: en.common };

function boxes() {
  return screen
    .getAllByRole("button", { pressed: false })
    .concat(screen.getAllByRole("button", { pressed: true }))
    .filter((button) => button.classList.contains("detection-box"));
}

beforeEach(() => {
  resetMockData();
  forgetHandedOffScan("demo-evening");
});

test("boxes click in one after another, in reading order", async () => {
  render(<ScanResults copy={copy} locale="en" />);
  await screen.findByText("8 pieces");
  const order = boxes()
    .sort((a, b) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    )
    .map((box) => box.style.getPropertyValue("--i"));
  expect(order).toEqual(["0", "1", "2", "3", "4", "5", "6", "7"]);
  expect(boxes().every((box) => box.classList.contains("click-in"))).toBe(true);
});

test("a removed piece pops off while the change saves", async () => {
  render(<ScanResults copy={copy} locale="en" />);
  await screen.findByText("8 pieces");
  const blue = screen.getByRole("button", { name: "Brick 2×3, blue, 93%" });
  fireEvent.click(blue);
  expect(blue.hasAttribute("data-selected")).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Remove piece" }));
  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  expect(blue.classList.contains("pop-off")).toBe(true);
  expect(await screen.findByText("Piece removed.")).toBeDefined();
  expect(
    screen.queryByRole("button", { name: "Brick 2×3, blue, 93%" }),
  ).toBeNull();
});

test("a scan handed off by the scanner shows without a loading state", async () => {
  const scan = await getScan("demo-evening", { delayMs: 0 });
  if (!scan) throw new Error("demo scan missing");
  handOffScan(scan);
  render(<ScanResults copy={copy} locale="en" />);
  expect(screen.queryByText(en.results.loading)).toBeNull();
  expect(screen.getByAltText(en.results.photoAlt)).toBeDefined();
  expect(
    screen
      .getByRole("button", { name: "Brick 2×2, dark gray, 58%" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
});
