import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { IdeaDetail } from "@/components/ideas/idea-detail";
import { IdeasScreen } from "@/components/ideas/ideas-screen";
import { en } from "@/i18n/dictionaries/en";
import { getIdea, getIdeas } from "@/lib/api";

const route = vi.hoisted(() => ({
  id: "demo-evening",
  ideaId: "race-car",
  search: "",
}));
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: route.id, ideaId: route.ideaId }),
  useSearchParams: () => new URLSearchParams(route.search),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const copyFor = (dict: typeof en) => ({
  ideaDetail: dict.ideaDetail,
  ideas: {
    difficulty: dict.ideas.difficulty,
    complete: dict.ideas.complete,
    usesNone: dict.ideas.usesNone,
  },
  themes: dict.ideas.picker.themes,
  results: { missing: dict.results.missing },
  common: {
    ideaOf: dict.common.ideaOf,
    missingCount: dict.common.missingCount,
    partsUsed: dict.common.partsUsed,
    partsMissing: dict.common.partsMissing,
    step: dict.common.step,
  },
});
const copy = copyFor(en);

/**
 * Opens an idea at this query. The screen reads it through Next; the data
 * layer reads the demo options from the browser's URL.
 */
function visit(ideaId: string, search = "theme=vehicles&mockDelay=0") {
  route.ideaId = ideaId;
  route.search = search;
  window.history.replaceState(
    null,
    "",
    `/en/scan/${route.id}/ideas/${ideaId}?${search}`,
  );
}

/** Ideas the list would have asked for, so there's a set to read. */
async function askForIdeas(locale: "en" | "id" = "en") {
  window.history.replaceState(null, "", "/en/scan?mockDelay=0");
  return getIdeas(route.id, "vehicles", locale);
}

const href = (name: RegExp | string) =>
  screen.getByRole("link", { name }).getAttribute("href");

beforeEach(() => {
  // The mock keeps scans in localStorage; empty, it starts from the demo scans.
  localStorage.clear();
  route.id = "demo-evening";
});

test("shows the idea's parts, what's missing and numbered steps", async () => {
  await askForIdeas();
  visit("race-car");
  render(<IdeaDetail copy={copy} locale="en" />);
  expect(
    await screen.findByRole("heading", { level: 1, name: "Little race car" }),
  ).toBeDefined();
  expect(screen.getByText("IDEA 1/3 · Vehicles")).toBeDefined();
  expect(screen.getByText("Easy")).toBeDefined();
  expect(screen.getByText("4 parts missing")).toBeDefined();

  // The evening scan has the black plate and one of the two yellow rounds.
  const used = screen.getByRole("region", { name: "Parts used" });
  expect(within(used).getAllByRole("listitem")).toHaveLength(2);
  for (const line of ["1× Plate 2×4 black", "1× Round 1×1 yellow"]) {
    expect(within(used).getByText(line)).toBeDefined();
  }
  const missing = screen.getByRole("region", { name: "Parts missing" });
  expect(within(missing).getAllByRole("listitem")).toHaveLength(4);
  for (const line of [
    "1× Brick 2×4 red",
    "1× Slope 45° 2×2 green",
    "1× Brick 2×2 black",
    "1× Round 1×1 yellow",
  ]) {
    expect(within(missing).getByText(line)).toBeDefined();
  }

  const steps = within(screen.getByRole("region", { name: "Steps" }));
  const items = steps.getAllByRole("listitem");
  expect(items).toHaveLength(3);
  expect(items[0].textContent).toContain("Step 1");
  expect(items[0].textContent).toContain(
    "Put the red 2×4 brick on a black 2×4 plate as the body.",
  );
});

test("the summary's counts add up to the idea's parts", async () => {
  await askForIdeas();
  visit("race-car");
  render(<IdeaDetail copy={copy} locale="en" />);
  const summary = await screen.findByRole("region", {
    name: "What you're missing",
  });
  const counts = within(summary)
    .getAllByRole("definition")
    .map((dd) => Number(dd.querySelector(".sr-only")?.textContent));
  const stored = await getIdea("demo-evening", "race-car");
  const pieces = (lines: { quantity: number }[] = []) =>
    lines.reduce((total, line) => total + line.quantity, 0);
  const have = pieces(stored?.idea.used);
  const lacking = pieces(stored?.idea.missing);
  expect(counts).toEqual([have + lacking, have, lacking]);
  expect(counts).toEqual([6, 2, 4]);
  expect(
    within(summary).getByText(
      "Find 4 more pieces, or swap in similar ones you have.",
    ),
  ).toBeDefined();
});

test("an idea that needs nothing else says so", async () => {
  const [first] = await askForIdeas();
  window.history.replaceState(null, "", "/en/scan?mockDelay=0");
  await getIdeas("demo-evening", "vehicles", "en", { exclude: [first.id] });
  // Skipping the race car brings in the go-kart, which uses only evening pieces.
  visit("go-kart");
  render(<IdeaDetail copy={copy} locale="en" />);
  await screen.findByRole("heading", { level: 1, name: "Go-kart" });
  expect(screen.getByText("Uses only your pieces")).toBeDefined();
  expect(screen.getByText(en.ideaDetail.summary.none)).toBeDefined();
  expect(screen.queryByRole("region", { name: "Parts missing" })).toBeNull();
});

test("steps tick off one by one, in this browser only", async () => {
  await askForIdeas();
  visit("race-car");
  render(<IdeaDetail copy={copy} locale="en" />);
  const first = (await screen.findByRole("checkbox", {
    name: "Step 1 done",
  })) as HTMLInputElement;
  fireEvent.click(first);
  expect(first.checked).toBe(true);
  expect(screen.getByText("1 of 3 steps done")).toBeDefined();
  // The step's text ticks it too.
  fireEvent.click(screen.getByText(/^Add the green 2×2 slope/));
  fireEvent.click(screen.getByRole("checkbox", { name: "Step 3 done" }));
  expect(screen.getByText(en.ideaDetail.allDone)).toBeDefined();
  fireEvent.click(first);
  expect(first.checked).toBe(false);
  expect(screen.getByText("2 of 3 steps done")).toBeDefined();
});

test("back, previous and next keep the theme and demo options", async () => {
  await askForIdeas();
  visit("delivery-truck");
  render(<IdeaDetail copy={copy} locale="en" />);
  await screen.findByRole("heading", { level: 1, name: "Delivery truck" });
  expect(screen.getByText("IDEA 2/3 · Vehicles")).toBeDefined();
  expect(href(/All ideas/)).toBe(
    "/en/scan/demo-evening/ideas?theme=vehicles&mockDelay=0",
  );
  const nav = within(screen.getByRole("navigation", { name: "Other ideas" }));
  expect(
    nav
      .getByRole("link", { name: /Previous idea.*Little race car/ })
      .getAttribute("href"),
  ).toBe("/en/scan/demo-evening/ideas/race-car?theme=vehicles&mockDelay=0");
  expect(
    nav
      .getByRole("link", { name: /Next idea.*Little boat/ })
      .getAttribute("href"),
  ).toBe("/en/scan/demo-evening/ideas/little-boat?theme=vehicles&mockDelay=0");
});

test("the first idea has no previous one and the last no next one", async () => {
  await askForIdeas();
  visit("race-car");
  render(<IdeaDetail copy={copy} locale="en" />);
  await screen.findByRole("heading", { level: 1, name: "Little race car" });
  expect(screen.queryByRole("link", { name: /Previous idea/ })).toBeNull();
  expect(screen.getByRole("link", { name: /Next idea/ })).toBeDefined();
});

test("without ?theme, as after a language switch, links use the set's theme", async () => {
  await askForIdeas();
  visit("little-boat", "");
  render(<IdeaDetail copy={copy} locale="en" />);
  await screen.findByRole("heading", { level: 1, name: "Little boat" });
  expect(href(/All ideas/)).toBe("/en/scan/demo-evening/ideas?theme=vehicles");
  expect(screen.queryByRole("link", { name: /Next idea/ })).toBeNull();
});

test("an unknown or replaced idea leads back to the ideas", async () => {
  await askForIdeas();
  visit("dragon");
  render(<IdeaDetail copy={copy} locale="en" />);
  expect(
    await screen.findByRole("heading", {
      level: 1,
      name: en.ideaDetail.missing.title,
    }),
  ).toBeDefined();
  expect(href(en.ideaDetail.missing.action)).toBe(
    "/en/scan/demo-evening/ideas?theme=vehicles&mockDelay=0",
  );
});

test("an unknown scan offers a new scan", async () => {
  route.id = "nope";
  visit("race-car");
  render(<IdeaDetail copy={copy} locale="en" />);
  expect(
    await screen.findByRole("heading", {
      level: 1,
      name: en.results.missing.title,
    }),
  ).toBeDefined();
  expect(href("Start a new scan")).toBe("/en/scan");
});

test("See steps on an idea card lands on that idea", async () => {
  route.search = "theme=vehicles&mockDelay=0";
  window.history.replaceState(
    null,
    "",
    `/en/scan/${route.id}/ideas?${route.search}`,
  );
  const list = render(
    <IdeasScreen
      copy={{
        ideas: en.ideas,
        results: { loading: en.results.loading, missing: en.results.missing },
        common: {
          ideaOf: en.common.ideaOf,
          missingCount: en.common.missingCount,
        },
      }}
      locale="en"
    />,
  );
  const link = await screen.findByRole("link", {
    name: "See steps: Little boat",
  });
  const url = new URL(link.getAttribute("href") ?? "", "http://legoin.test");
  list.unmount();

  const [, , , scanId, , ideaId] = url.pathname.split("/");
  route.id = scanId;
  visit(ideaId, url.search.slice(1));
  render(<IdeaDetail copy={copy} locale="en" />);
  expect(
    await screen.findByRole("heading", { level: 1, name: "Little boat" }),
  ).toBeDefined();
});
