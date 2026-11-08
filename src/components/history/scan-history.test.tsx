import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { ScanHistory } from "@/components/history/scan-history";
import { en } from "@/i18n/dictionaries/en";
import { id } from "@/i18n/dictionaries/id";
import { formatDate } from "@/i18n/format";
import { deleteScan, listScans } from "@/lib/api";
import type { Detection, Idea, Scan } from "@/lib/domain";

vi.mock("@/lib/api", () => ({ listScans: vi.fn(), deleteScan: vi.fn() }));

const copyFor = (dict: typeof en) => ({
  history: dict.history,
  themes: dict.ideas.picker.themes,
  pieces: dict.common.pieces,
});

const piece = (n: number): Detection => ({
  id: `piece-${n}`,
  part: "brick-2x4",
  color: "red",
  box: null,
  confidence: null,
});

const idea = (id: string, title: string): Idea => ({
  id,
  theme: "animals",
  difficulty: "easy",
  title,
  summary: "",
  steps: [],
  used: [],
  missing: [],
});

// Midday UTC, so the date is the same wherever the tests run.
const evening: Scan = {
  id: "evening",
  createdAt: "2026-10-26T12:00:00.000Z",
  photo: { src: "/contoh/kepingan-2.jpg", width: 1200, height: 800 },
  detections: [1, 2, 3, 4, 5, 6, 7, 8].map(piece),
  lastTheme: "animals",
};
const desk: Scan = {
  id: "desk",
  createdAt: "2026-10-25T12:00:00.000Z",
  photo: { src: "/contoh/kepingan.jpg", width: 1200, height: 800 },
  detections: [piece(1)],
};

const opens = (scan: Scan, locale: "en" | "id" = "en") =>
  screen.getByRole("link", { name: formatDate(scan.createdAt, locale) });

function showHistory(scans: Scan[], locale: "en" | "id" = "en") {
  vi.mocked(listScans).mockResolvedValue(scans);
  return render(
    <ScanHistory copy={copyFor(locale === "en" ? en : id)} locale={locale} />,
  );
}

beforeEach(() => {
  vi.mocked(listScans).mockReset();
  vi.mocked(deleteScan).mockReset().mockResolvedValue(undefined);
});

test("lists scans in the order the data layer gives, newest first", async () => {
  showHistory([evening, desk]);
  expect(screen.getByText(en.history.loading)).toBeDefined();

  const cards = await screen.findAllByRole("article");
  expect(cards).toHaveLength(2);
  expect(within(cards[0]).getByRole("heading").textContent).toContain(
    "October 26, 2026",
  );
  expect(within(cards[1]).getByRole("heading").textContent).toContain(
    "October 25, 2026",
  );
  expect(screen.getByText("2 scans")).toBeDefined();
});

test("each scan shows its pieces and last theme, and opens its results", async () => {
  showHistory([evening, desk]);
  const [first, second] = await screen.findAllByRole("article");

  expect(within(first).getByText("8 pieces")).toBeDefined();
  expect(within(first).getByText("Last theme: Animals")).toBeDefined();
  expect(opens(evening).getAttribute("href")).toBe("/en/scan/evening");
  const ideas = within(first).getByRole("link", { name: /^See ideas/ });
  expect(ideas.getAttribute("href")).toBe(
    "/en/scan/evening/ideas?theme=animals",
  );

  // No theme yet: no shortcut to ideas.
  expect(within(second).getByText("1 piece")).toBeDefined();
  expect(within(second).queryByText(/Last theme/)).toBeNull();
  expect(within(second).queryByRole("link", { name: /See ideas/ })).toBeNull();
  expect(opens(desk).getAttribute("href")).toBe("/en/scan/desk");
});

test("reads in Indonesian, dates included", async () => {
  showHistory([evening], "id");
  const card = await screen.findByRole("article");
  expect(within(card).getByRole("heading").textContent).toContain(
    "26 Oktober 2026",
  );
  expect(within(card).getByText("8 kepingan")).toBeDefined();
  expect(within(card).getByText("Tema terakhir: Hewan")).toBeDefined();
  expect(opens(evening, "id").getAttribute("href")).toBe("/id/scan/evening");
  expect(within(card).getByRole("button", { name: /^Hapus/ })).toBeDefined();
});

test("delete asks first, and keeping the scan puts focus back", async () => {
  showHistory([evening, desk]);
  const [first] = await screen.findAllByRole("article");

  const remove = within(first).getByRole("button", { name: /^Delete/ });
  // Each delete button says which scan it deletes.
  expect(remove.textContent).toContain(formatDate(evening.createdAt, "en"));
  fireEvent.click(remove);

  const question = within(first).getByRole("group", {
    name: en.history.delete.question,
  });
  const keep = within(question).getByRole("button", { name: "Keep it" });
  expect(document.activeElement).toBe(keep);
  expect(deleteScan).not.toHaveBeenCalled();

  fireEvent.click(keep);
  expect(within(first).queryByRole("group")).toBeNull();
  expect(document.activeElement).toBe(
    within(first).getByRole("button", { name: /^Delete/ }),
  );
  expect(deleteScan).not.toHaveBeenCalled();
  expect(screen.getAllByRole("article")).toHaveLength(2);
});

test("confirming deletes the scan and moves focus to the next one", async () => {
  showHistory([evening, desk]);
  const [first] = await screen.findAllByRole("article");

  fireEvent.click(within(first).getByRole("button", { name: /^Delete/ }));
  fireEvent.click(within(first).getByRole("button", { name: /^Delete scan/ }));

  expect(deleteScan).toHaveBeenCalledWith("evening");
  await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(1));
  expect(screen.getByRole("status").textContent).toBe("Scan deleted.");
  // Focus moves in an effect after the list re-renders; wait for it.
  await waitFor(() => expect(document.activeElement).toBe(opens(desk)));
  expect(screen.getByText("1 scan")).toBeDefined();
});

test("a failed delete keeps the scan and says so", async () => {
  vi.mocked(deleteScan).mockRejectedValue(new Error("offline"));
  showHistory([evening, desk]);
  const [first] = await screen.findAllByRole("article");

  fireEvent.click(within(first).getByRole("button", { name: /^Delete/ }));
  fireEvent.click(within(first).getByRole("button", { name: /^Delete scan/ }));

  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toBe(
      en.history.delete.failed,
    ),
  );
  expect(screen.getAllByRole("article")).toHaveLength(2);
  // The button comes back after the status, and focus after the button.
  await waitFor(() =>
    expect(document.activeElement).toBe(
      within(first).getByRole("button", { name: /^Delete/ }),
    ),
  );
});

test("deleting the last scan leaves the empty state, focused", async () => {
  showHistory([desk]);
  const card = await screen.findByRole("article");

  fireEvent.click(within(card).getByRole("button", { name: /^Delete/ }));
  fireEvent.click(within(card).getByRole("button", { name: /^Delete scan/ }));

  const heading = await screen.findByRole("heading", {
    name: en.history.empty.title,
  });
  // Focus moves in an effect after the list re-renders; wait for it.
  await waitFor(() => expect(document.activeElement).toBe(heading));
  expect(screen.getByRole("status").textContent).toBe("Scan deleted.");
});

test("Clear my scans deletes them all after asking", async () => {
  showHistory([evening, desk]);
  await screen.findAllByRole("article");

  fireEvent.click(screen.getByRole("button", { name: "Clear my scans" }));
  screen.getByRole("group", {
    name: "Delete all 2 scans from this browser? You can't get them back.",
  });
  expect(deleteScan).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Delete all" }));

  const heading = await screen.findByRole("heading", {
    name: en.history.empty.title,
  });
  expect(deleteScan).toHaveBeenCalledWith("evening");
  expect(deleteScan).toHaveBeenCalledWith("desk");
  await waitFor(() => expect(document.activeElement).toBe(heading));
  expect(screen.getByRole("status").textContent).toBe(en.history.clear.done);
});

test("Clear my scans keeps the ones it couldn't delete", async () => {
  vi.mocked(deleteScan).mockImplementation(async (scanId) => {
    if (scanId === "desk") throw new Error("offline");
  });
  showHistory([evening, desk]);
  await screen.findAllByRole("article");

  fireEvent.click(screen.getByRole("button", { name: "Clear my scans" }));
  fireEvent.click(screen.getByRole("button", { name: "Delete all" }));

  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toBe(
      en.history.clear.failed,
    ),
  );
  expect(screen.getAllByRole("article")).toHaveLength(1);
  await waitFor(() => expect(document.activeElement).toBe(opens(desk)));
  // With one scan left, its own Delete is enough.
  expect(screen.queryByRole("button", { name: "Clear my scans" })).toBeNull();
});

test("with no scans, the empty state leads to a first scan", async () => {
  showHistory([]);
  const empty = await screen.findByRole("region", {
    name: en.history.empty.title,
  });
  const start = within(empty).getByRole("link", { name: "Start a scan" });
  expect(start.getAttribute("href")).toBe("/en/scan");
  // Its red button is the only one on the screen.
  expect(screen.queryByRole("link", { name: en.history.newScan })).toBeNull();
  expect(screen.queryByRole("article")).toBeNull();
});

test("when scans can't load, it offers to try again", async () => {
  vi.mocked(listScans).mockRejectedValueOnce(new Error("offline"));
  showHistory([desk]);
  const retry = await screen.findByRole("button", { name: "Try again" });
  expect(screen.getByText(en.history.failed.title)).toBeDefined();

  fireEvent.click(retry);
  expect(await screen.findByRole("article")).toBeDefined();
  expect(listScans).toHaveBeenCalledTimes(2);
});

test("each scan lists the ideas it keeps, linking to each", async () => {
  showHistory([
    {
      ...evening,
      ideas: {
        theme: "animals",
        locale: "en",
        items: [idea("rubber-duck", "Rubber duck"), idea("turtle", "Turtle")],
      },
    },
    desk,
  ]);
  const [first, second] = await screen.findAllByRole("article");

  const list = within(first).getByRole("list", { name: "Latest ideas" });
  const links = within(list).getAllByRole("link");
  expect(links.map((link) => link.textContent)).toEqual([
    `Rubber duck, ${formatDate(evening.createdAt, "en")}`,
    `Turtle, ${formatDate(evening.createdAt, "en")}`,
  ]);
  // Each one says which scan it belongs to, like the other shortcuts.
  expect(
    within(first).getByRole("link", { name: /^Turtle, October 26, 2026/ }),
  ).toBe(links[1]);
  expect(links[1].getAttribute("href")).toBe(
    "/en/scan/evening/ideas/turtle?theme=animals",
  );
  expect(links[1].querySelector("[lang]")?.getAttribute("lang")).toBe("en");

  // No ideas kept: no list.
  expect(within(second).queryByRole("list")).toBeNull();
});

test("idea titles keep the language they were written in", async () => {
  showHistory(
    [
      {
        ...evening,
        lastTheme: "surprise",
        ideas: {
          theme: "surprise",
          locale: "en",
          items: [idea("race-car", "Little race car")],
        },
      },
      {
        ...desk,
        lastTheme: "vehicles",
        ideas: {
          theme: "vehicles",
          locale: "id",
          items: [idea("race-car", "Mobil balap kecil")],
        },
      },
    ],
    "id",
  );
  const [first, second] = await screen.findAllByRole("article");

  // Written in English, shown on the Indonesian page as is, marked as English.
  const english = within(first).getByRole("link", { name: /^Little race car/ });
  expect(english.getAttribute("href")).toBe(
    "/id/scan/evening/ideas/race-car?theme=surprise",
  );
  expect(english.querySelector("[lang]")?.textContent).toBe("Little race car");
  expect(english.querySelector("[lang]")?.getAttribute("lang")).toBe("en");
  expect(
    within(first).getByRole("list", { name: "Ide terakhir" }),
  ).toBeDefined();

  const indonesian = within(second).getByRole("link", {
    name: /^Mobil balap kecil/,
  });
  expect(indonesian.querySelector("[lang]")?.getAttribute("lang")).toBe("id");
});

test("an empty set of ideas lists nothing", async () => {
  showHistory([
    { ...evening, ideas: { theme: "animals", locale: "en", items: [] } },
  ]);
  const card = await screen.findByRole("article");
  expect(within(card).queryByRole("list")).toBeNull();
  expect(within(card).getByText("Last theme: Animals")).toBeDefined();
});
