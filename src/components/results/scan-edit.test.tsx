import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { ScanResults } from "@/components/results/scan-results";
import { en } from "@/i18n/dictionaries/en";
import { getScan, resetMockData } from "@/lib/mock/api";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "demo-evening" }),
}));

const copy = { results: en.results, common: en.common };

async function open() {
  render(<ScanResults copy={copy} locale="en" />);
  await screen.findByText("8 pieces");
}

const piecePanel = () => screen.getByRole("region", { name: "Selected piece" });
const addForm = () => screen.getByRole("form", { name: "Add a missed piece" });

beforeEach(() => {
  resetMockData();
});

test("fixing the flagged piece saves it and clears the flag", async () => {
  await open();
  const panel = piecePanel();
  fireEvent.change(within(panel).getByRole("combobox", { name: "Part" }), {
    target: { value: "plate-2x2" },
  });
  fireEvent.click(within(panel).getByRole("button", { name: "Save changes" }));
  expect(await screen.findByText("Piece updated.")).toBeDefined();
  expect(screen.queryByText("1 piece to check")).toBeNull();
  expect(within(panel).getByText("Edited")).toBeDefined();
  const saved = await getScan("demo-evening", { delayMs: 0 });
  expect(saved?.detections.find((d) => d.id === "evening-6")).toMatchObject({
    part: "plate-2x2",
    edited: true,
  });
});

test("removing asks first, and undo brings the piece back", async () => {
  await open();
  fireEvent.click(screen.getByRole("button", { name: "Brick 2×3, blue, 93%" }));
  fireEvent.click(screen.getByRole("button", { name: "Remove piece" }));
  expect(screen.getByText(en.results.edit.confirm)).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  expect(await screen.findByText("Piece removed.")).toBeDefined();
  expect(screen.getByText("7 pieces", { selector: "p" })).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Undo last change" }));
  expect(await screen.findByText("Change undone.")).toBeDefined();
  expect(
    screen.getByRole("button", { name: "Brick 2×3, blue, 93%" }),
  ).toBeDefined();
});

test("missed pieces can be added and are selected", async () => {
  await open();
  const form = addForm();
  fireEvent.change(within(form).getByRole("combobox", { name: "Part" }), {
    target: { value: "round-1x1" },
  });
  fireEvent.change(within(form).getByRole("spinbutton", { name: "How many" }), {
    target: { value: "2" },
  });
  fireEvent.click(
    within(form).getByRole("button", { name: "Add to inventory" }),
  );
  expect(await screen.findByText("2 pieces added.")).toBeDefined();
  expect(screen.getByText("10 pieces", { selector: "p" })).toBeDefined();
  expect(within(piecePanel()).getByText(en.results.piece.added)).toBeDefined();
});

test("a quantity out of range is refused", async () => {
  await open();
  const form = addForm();
  fireEvent.change(within(form).getByRole("spinbutton", { name: "How many" }), {
    target: { value: "0" },
  });
  fireEvent.click(
    within(form).getByRole("button", { name: "Add to inventory" }),
  );
  expect(within(form).getByRole("alert").textContent).toBe(
    en.results.add.invalid,
  );
});

test("continue leads to the ideas step", async () => {
  await open();
  expect(
    screen.getByRole("link", { name: /Get build ideas/ }).getAttribute("href"),
  ).toBe("/en/scan/demo-evening/ideas");
});
