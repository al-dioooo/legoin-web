import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { ScanResults } from "@/components/results/scan-results";
import { en } from "@/i18n/dictionaries/en";
import { getScan, updateDetections } from "@/lib/api";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "demo-evening" }),
}));

const copy = { results: en.results, common: en.common };

async function open() {
  render(<ScanResults copy={copy} locale="en" />);
  await screen.findByText("8 pieces");
}

/** Removes every piece of the evening demo except the first `keep`. */
async function keepOnly(keep: number) {
  const scan = await getScan("demo-evening");
  const changes = (scan?.detections ?? [])
    .slice(keep)
    .map(({ id }) => ({ type: "remove" as const, id }));
  await updateDetections("demo-evening", changes);
}

const piecePanel = () => screen.getByRole("region", { name: "Selected piece" });
const addForm = () => screen.getByRole("form", { name: "Add a missed piece" });

beforeEach(() => {
  // The mock keeps scans in localStorage; empty, it starts from the demo scans.
  localStorage.clear();
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
  const saved = await getScan("demo-evening");
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

test("removing the last piece shows the empty state, and undo brings it back", async () => {
  await keepOnly(1);
  render(<ScanResults copy={copy} locale="en" />);
  fireEvent.click(
    await screen.findByRole("button", { name: "Plate 2×4, black, 92%" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Remove piece" }));
  fireEvent.click(screen.getByRole("button", { name: "Remove" }));

  const title = await screen.findByRole("heading", {
    name: en.results.empty.title,
  });
  // The removed piece's controls are gone, so focus moves to the empty state.
  await waitFor(() => expect(document.activeElement).toBe(title));
  expect(screen.queryByRole("region", { name: "Selected piece" })).toBeNull();
  expect(screen.queryByRole("list")).toBeNull();
  expect(screen.queryByRole("button", { name: "Hide labels" })).toBeNull();
  expect(screen.getByAltText(en.results.photoAltPlain)).toBeDefined();
  expect(screen.queryByRole("link", { name: /Get build ideas/ })).toBeNull();
  const ideas = screen.getByRole("button", { name: /Get build ideas/ });
  expect(ideas).toHaveProperty("disabled", true);
  expect(
    document.getElementById(ideas.getAttribute("aria-describedby") ?? "")
      ?.textContent,
  ).toBe(en.results.empty.continueHint);

  fireEvent.click(screen.getByRole("button", { name: "Undo last change" }));
  expect(
    await screen.findByRole("button", { name: "Plate 2×4, black, 92%" }),
  ).toBeDefined();
  expect(
    screen.queryByRole("heading", { name: en.results.empty.title }),
  ).toBeNull();
  expect(screen.getByRole("link", { name: /Get build ideas/ })).toBeDefined();
});

test("a scan with no pieces leads to adding one or retaking the photo", async () => {
  await keepOnly(0);
  render(<ScanResults copy={copy} locale="en" />);
  const title = await screen.findByRole("heading", {
    name: en.results.empty.title,
  });
  // Opening the scan doesn't move focus; only removing the last piece does.
  expect(document.activeElement).not.toBe(title);
  expect(
    screen.getByRole("link", { name: "Retake photo" }).getAttribute("href"),
  ).toBe("/en/scan");
  fireEvent.click(screen.getByRole("button", { name: "Add a missed piece" }));
  const part = within(addForm()).getByRole("combobox", { name: "Part" });
  expect(document.activeElement).toBe(part);

  fireEvent.click(
    within(addForm()).getByRole("button", { name: "Add to inventory" }),
  );
  expect(await screen.findByText("1 piece added.")).toBeDefined();
  expect(
    screen.queryByRole("heading", { name: en.results.empty.title }),
  ).toBeNull();
});
