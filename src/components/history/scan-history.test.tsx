import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { ScanHistory } from "@/components/history/scan-history";
import { en } from "@/i18n/dictionaries/en";
import { id } from "@/i18n/dictionaries/id";
import { formatDate } from "@/i18n/format";
import { listScans } from "@/lib/api";
import type { Detection, Scan } from "@/lib/domain";

vi.mock("@/lib/api", () => ({ listScans: vi.fn() }));

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
