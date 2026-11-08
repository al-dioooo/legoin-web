import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { Activity, type ReactNode } from "react";
import { beforeEach, expect, test, vi } from "vitest";
import { IdeasScreen } from "@/components/ideas/ideas-screen";
import { en } from "@/i18n/dictionaries/en";
import { id } from "@/i18n/dictionaries/id";
import { getIdeas, getScan, updateDetections } from "@/lib/api";

const route = vi.hoisted(() => ({ id: "demo-evening", search: "" }));
const push = vi.fn();
const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: route.id }),
  useSearchParams: () => new URLSearchParams(route.search),
  useRouter: () => ({ push, replace }),
}));
// The real data layer, watched, to tell showing kept ideas from asking again.
vi.mock("@/lib/api", async (importOriginal) => {
  const api = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...api,
    getScan: vi.fn(api.getScan),
    getIdeas: vi.fn(api.getIdeas),
  };
});

const copyFor = (dict: typeof en) => ({
  ideas: dict.ideas,
  results: { loading: dict.results.loading, missing: dict.results.missing },
  common: {
    ideaOf: dict.common.ideaOf,
    missingCount: dict.common.missingCount,
  },
});
const copy = copyFor(en);

const radio = (name: RegExp) =>
  screen.getByRole("radio", { name }) as HTMLInputElement;

/**
 * Opens the page at this query. The screen reads it through Next; the data
 * layer reads the demo options from the browser's URL.
 */
function visit(search: string) {
  route.search = search;
  window.history.replaceState(null, "", `/en/scan/${route.id}/ideas?${search}`);
}

beforeEach(() => {
  // The mock keeps scans in localStorage; empty, it starts from the demo scans.
  localStorage.clear();
  route.id = "demo-evening";
  visit("");
  push.mockClear();
  replace.mockClear();
  vi.mocked(getScan).mockClear();
  vi.mocked(getIdeas).mockClear();
});

/** Ideas asked for before the page opens, as an earlier visit would have. */
async function askedBefore(
  theme: "animals" | "vehicles",
  locale: "en" | "id" = "en",
) {
  const page = window.location.href;
  window.history.replaceState(null, "", "/en/scan?mockDelay=0");
  const ideas = await getIdeas(route.id, theme, locale);
  window.history.replaceState(null, "", page);
  vi.mocked(getIdeas).mockClear();
  return ideas;
}

const titles = () =>
  screen
    .getAllByRole("article")
    .map((card) => within(card).getByRole("heading").textContent);

test("asks for a theme, with Surprise me selected by default", async () => {
  render(<IdeasScreen copy={copy} locale="en" />);
  expect(
    await screen.findByRole("heading", { name: en.ideas.picker.title }),
  ).toBeDefined();
  expect(screen.getByRole("group", { name: "Theme" })).toBeDefined();
  expect(screen.getAllByRole("radio")).toHaveLength(4);
  expect(radio(/^Surprise me/).checked).toBe(true);
});

test("preselects the theme used last", async () => {
  await askedBefore("animals");
  render(<IdeasScreen copy={copy} locale="en" />);
  await screen.findByRole("heading", { name: en.ideas.picker.title });
  expect(radio(/^Animals/).checked).toBe(true);
});

test("the chosen theme goes into the URL", async () => {
  visit("mockDelay=0");
  render(<IdeasScreen copy={copy} locale="en" />);
  await screen.findByRole("heading", { name: en.ideas.picker.title });
  fireEvent.click(radio(/^Vehicles/));
  fireEvent.click(screen.getByRole("button", { name: /Get ideas/ }));
  expect(push).toHaveBeenCalledWith(
    "/en/scan/demo-evening/ideas?mockDelay=0&theme=vehicles",
  );
});

test("with a theme, it asks for ideas in that theme and language", async () => {
  visit("theme=buildings&mockDelay=0");
  render(<IdeasScreen copy={copyFor(id)} locale="id" />);
  expect(await screen.findByText("Rumah kecil")).toBeDefined();
  expect(radio(/^Bangunan/).checked).toBe(true);
  const scan = await getScan("demo-evening");
  expect(scan?.lastTheme).toBe("buildings");
});

test("switching theme replaces the URL in place", async () => {
  visit("theme=animals&mockDelay=0");
  render(<IdeasScreen copy={copy} locale="en" />);
  await screen.findByText("Turtle");
  fireEvent.click(radio(/^Buildings/));
  expect(replace).toHaveBeenCalledWith(
    "/en/scan/demo-evening/ideas?theme=buildings&mockDelay=0",
    { scroll: false },
  );
});

test("an unknown theme in the URL asks for one", async () => {
  visit("theme=dinosaurs");
  render(<IdeasScreen copy={copy} locale="en" />);
  expect(
    await screen.findByRole("heading", { name: en.ideas.picker.title }),
  ).toBeDefined();
});

test("an unknown scan id offers a new scan, without asking for ideas", async () => {
  route.id = "nope";
  visit("theme=animals&mockDelay=0");
  render(<IdeasScreen copy={copy} locale="en" />);
  const action = await screen.findByRole("link", { name: "Start a new scan" });
  expect(action.getAttribute("href")).toBe("/en/scan");
  expect(getIdeas).not.toHaveBeenCalled();
});

test("shows three ideas with difficulty, counts and a link to the steps", async () => {
  visit("theme=vehicles&mockDelay=0");
  render(<IdeasScreen copy={copy} locale="en" />);
  expect(await screen.findByText("3 ideas ready.")).toBeDefined();
  const cards = screen.getAllByRole("article");
  expect(cards).toHaveLength(3);
  // The race car needs a red 2×4, a green slope, a black 2×2 and one more
  // yellow round than the evening scan has.
  const raceCar = within(cards[0]);
  expect(raceCar.getByText("Easy")).toBeDefined();
  expect(raceCar.getByText("Uses 2 of your pieces")).toBeDefined();
  expect(raceCar.getByText("4 parts missing")).toBeDefined();
  expect(
    raceCar
      .getByRole("link", { name: "See steps: Little race car" })
      .getAttribute("href"),
  ).toBe("/en/scan/demo-evening/ideas/race-car?theme=vehicles&mockDelay=0");
});

test("other ideas replace the shown ones, and full matches say so", async () => {
  visit("theme=vehicles&mockDelay=0");
  render(<IdeasScreen copy={copy} locale="en" />);
  await screen.findByRole("article", { name: "Little race car" });
  fireEvent.click(screen.getByRole("button", { name: "Try other ideas" }));
  const goKart = await screen.findByRole("article", { name: "Go-kart" });
  expect(within(goKart).getByText("Uses only your pieces")).toBeDefined();
  // The rocket needs nothing the evening scan has.
  const rocket = screen.getByRole("article", { name: "Rocket" });
  expect(within(rocket).getByText(en.ideas.usesNone)).toBeDefined();
  expect(screen.queryByRole("article", { name: "Little race car" })).toBeNull();
});

test("shows placeholders while ideas load", async () => {
  visit("theme=animals&mockDelay=300");
  render(<IdeasScreen copy={copy} locale="en" />);
  expect(await screen.findByText(en.ideas.finding)).toBeDefined();
  expect(screen.queryAllByRole("article")).toHaveLength(0);
  expect(
    await screen.findByText("3 ideas ready.", undefined, { timeout: 2000 }),
  ).toBeDefined();
});

test("a failed request can be retried", async () => {
  visit("theme=animals&mockDelay=0&mock=fail-network");
  render(<IdeasScreen copy={copy} locale="en" />);
  const alert = await screen.findByRole("alert");
  expect(
    within(alert).getByRole("heading", { name: en.ideas.failed.title }),
  ).toBeDefined();
  visit("theme=animals&mockDelay=0");
  fireEvent.click(within(alert).getByRole("button", { name: "Try again" }));
  expect(
    await screen.findByRole("article", { name: "Rubber duck" }),
  ).toBeDefined();
});

test("a scan with no pieces sends people back to add some", async () => {
  await updateDetections(
    "demo-evening",
    Array.from({ length: 8 }, (_, index) => ({
      type: "remove" as const,
      id: `evening-${index + 1}`,
    })),
  );
  visit("theme=animals&mockDelay=0");
  render(<IdeasScreen copy={copy} locale="en" />);
  expect(
    await screen.findByRole("heading", {
      level: 1,
      name: en.ideas.empty.title,
    }),
  ).toBeDefined();
  const back = screen.getByRole("link", { name: en.ideas.empty.action });
  expect(back.getAttribute("href")).toBe("/en/scan/demo-evening");
  expect(getIdeas).not.toHaveBeenCalled();
});

test("kept ideas for this theme and language show again without asking", async () => {
  const kept = await askedBefore("animals");
  visit("theme=animals&mockDelay=0");
  const { unmount } = render(<IdeasScreen copy={copy} locale="en" />);
  expect(await screen.findByText("3 ideas ready.")).toBeDefined();
  expect(titles()).toEqual(kept.map((idea) => idea.title));

  // Opening the URL again, or from history, doesn't ask either.
  unmount();
  render(<IdeasScreen copy={copy} locale="en" />);
  await screen.findByText("3 ideas ready.");
  expect(titles()).toEqual(kept.map((idea) => idea.title));
  expect(getIdeas).not.toHaveBeenCalled();
});

test("coming back to the page keeps the ideas it showed, without asking", async () => {
  visit("theme=vehicles&mockDelay=0");
  // Next keeps a page you leave in a hidden <Activity>; its effects run again
  // when you come back.
  const page = (mode: "visible" | "hidden"): ReactNode => (
    <Activity mode={mode}>
      <IdeasScreen copy={copy} locale="en" />
    </Activity>
  );
  const { rerender } = render(page("visible"));
  await screen.findByRole("article", { name: "Little race car" });
  fireEvent.click(screen.getByRole("button", { name: "Try other ideas" }));
  await screen.findByRole("article", { name: "Go-kart" });
  expect(getIdeas).toHaveBeenCalledTimes(2);

  rerender(page("hidden"));
  rerender(page("visible"));
  // The scan is read again, in case a correction dropped its ideas meanwhile.
  await waitFor(() => expect(getScan).toHaveBeenCalledTimes(2));
  await act(() => vi.mocked(getScan).mock.results[1].value);
  expect(screen.getByRole("article", { name: "Go-kart" })).toBeDefined();
  expect(getIdeas).toHaveBeenCalledTimes(2);
});

test("leaving while ideas load and coming back waits for the same ask", async () => {
  visit("theme=animals&mockDelay=300");
  const page = (mode: "visible" | "hidden"): ReactNode => (
    <Activity mode={mode}>
      <IdeasScreen copy={copy} locale="en" />
    </Activity>
  );
  const { rerender } = render(page("visible"));
  await waitFor(() => expect(getIdeas).toHaveBeenCalledTimes(1));
  rerender(page("hidden"));
  rerender(page("visible"));
  expect(
    await screen.findByText("3 ideas ready.", undefined, { timeout: 2000 }),
  ).toBeDefined();
  expect(getIdeas).toHaveBeenCalledTimes(1);
});

test("kept ideas in the other language are asked for again in this one", async () => {
  await askedBefore("animals", "en");
  visit("theme=animals&mockDelay=0");
  render(<IdeasScreen copy={copyFor(id)} locale="id" />);
  expect(await screen.findByText("Kura-kura")).toBeDefined();
  expect(getIdeas).toHaveBeenCalledTimes(1);
  expect(getIdeas).toHaveBeenCalledWith("demo-evening", "animals", "id", {
    exclude: [],
  });
});

test("other ideas and another theme still ask", async () => {
  const kept = await askedBefore("animals");
  visit("theme=animals&mockDelay=0");
  const { rerender } = render(<IdeasScreen copy={copy} locale="en" />);
  await screen.findByText("3 ideas ready.");
  expect(getIdeas).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole("button", { name: "Try other ideas" }));
  await screen.findByRole("article", { name: "Snail" });
  expect(getIdeas).toHaveBeenLastCalledWith("demo-evening", "animals", "en", {
    exclude: kept.map((idea) => idea.id),
  });

  // Switching theme replaces the URL; the page reads the new one.
  fireEvent.click(radio(/^Buildings/));
  visit("theme=buildings&mockDelay=0");
  rerender(<IdeasScreen copy={copy} locale="en" />);
  await screen.findByRole("article", { name: "Little house" });
  expect(getIdeas).toHaveBeenCalledTimes(2);
  expect(getIdeas).toHaveBeenLastCalledWith("demo-evening", "buildings", "en", {
    exclude: [],
  });

  // Back to animals: the scan now keeps buildings, so it asks again.
  visit("theme=animals&mockDelay=0");
  rerender(<IdeasScreen copy={copy} locale="en" />);
  await screen.findByRole("article", { name: "Snail" });
  expect(getIdeas).toHaveBeenCalledTimes(3);
});

test("after a correction changes the pieces, the list asks again", async () => {
  await askedBefore("animals");
  await updateDetections("demo-evening", [
    { type: "edit", id: "evening-6", part: "plate-2x2" },
  ]);
  visit("theme=animals&mockDelay=0");
  render(<IdeasScreen copy={copy} locale="en" />);
  expect(await screen.findByText("3 ideas ready.")).toBeDefined();
  expect(getIdeas).toHaveBeenCalledTimes(1);
});
