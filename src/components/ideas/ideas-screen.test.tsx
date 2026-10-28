import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { IdeasScreen } from "@/components/ideas/ideas-screen";
import { en } from "@/i18n/dictionaries/en";
import { id } from "@/i18n/dictionaries/id";
import {
  getIdeas,
  getScan,
  resetMockData,
  updateDetections,
} from "@/lib/mock/api";

const route = vi.hoisted(() => ({ id: "demo-evening", search: "" }));
const push = vi.fn();
const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: route.id }),
  useSearchParams: () => new URLSearchParams(route.search),
  useRouter: () => ({ push, replace }),
}));

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

beforeEach(() => {
  resetMockData();
  route.id = "demo-evening";
  route.search = "";
  push.mockClear();
  replace.mockClear();
});

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
  await getIdeas("demo-evening", "animals", "en", { delayMs: 0 });
  render(<IdeasScreen copy={copy} locale="en" />);
  await screen.findByRole("heading", { name: en.ideas.picker.title });
  expect(radio(/^Animals/).checked).toBe(true);
});

test("the chosen theme goes into the URL", async () => {
  route.search = "mockDelay=0";
  render(<IdeasScreen copy={copy} locale="en" />);
  await screen.findByRole("heading", { name: en.ideas.picker.title });
  fireEvent.click(radio(/^Vehicles/));
  fireEvent.click(screen.getByRole("button", { name: /Get ideas/ }));
  expect(push).toHaveBeenCalledWith(
    "/en/scan/demo-evening/ideas?mockDelay=0&theme=vehicles",
  );
});

test("with a theme, it asks for ideas in that theme and language", async () => {
  route.search = "theme=buildings&mockDelay=0";
  render(<IdeasScreen copy={copyFor(id)} locale="id" />);
  expect(await screen.findByText("Rumah kecil")).toBeDefined();
  expect(radio(/^Bangunan/).checked).toBe(true);
  const scan = await getScan("demo-evening", { delayMs: 0 });
  expect(scan?.lastTheme).toBe("buildings");
});

test("switching theme replaces the URL in place", async () => {
  route.search = "theme=animals&mockDelay=0";
  render(<IdeasScreen copy={copy} locale="en" />);
  await screen.findByText("Turtle");
  fireEvent.click(radio(/^Buildings/));
  expect(replace).toHaveBeenCalledWith(
    "/en/scan/demo-evening/ideas?theme=buildings&mockDelay=0",
    { scroll: false },
  );
});

test("an unknown theme in the URL asks for one", async () => {
  route.search = "theme=dinosaurs";
  render(<IdeasScreen copy={copy} locale="en" />);
  expect(
    await screen.findByRole("heading", { name: en.ideas.picker.title }),
  ).toBeDefined();
});

test("an unknown scan id offers a new scan", async () => {
  route.id = "nope";
  render(<IdeasScreen copy={copy} locale="en" />);
  const action = await screen.findByRole("link", { name: "Start a new scan" });
  expect(action.getAttribute("href")).toBe("/en/scan");
});

test("shows three ideas with difficulty, counts and a link to the steps", async () => {
  route.search = "theme=vehicles&mockDelay=0";
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
  route.search = "theme=vehicles&mockDelay=0";
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
  route.search = "theme=animals&mockDelay=300";
  render(<IdeasScreen copy={copy} locale="en" />);
  expect(await screen.findByText(en.ideas.finding)).toBeDefined();
  expect(screen.queryAllByRole("article")).toHaveLength(0);
  expect(
    await screen.findByText("3 ideas ready.", undefined, { timeout: 2000 }),
  ).toBeDefined();
});

test("a failed request can be retried", async () => {
  route.search = "theme=animals&mockDelay=0&mock=fail-network";
  render(<IdeasScreen copy={copy} locale="en" />);
  const alert = await screen.findByRole("alert");
  expect(
    within(alert).getByRole("heading", { name: en.ideas.failed.title }),
  ).toBeDefined();
  route.search = "theme=animals&mockDelay=0";
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
    { delayMs: 0 },
  );
  route.search = "theme=animals&mockDelay=0";
  render(<IdeasScreen copy={copy} locale="en" />);
  const back = await screen.findByRole("link", { name: en.ideas.empty.action });
  expect(back.getAttribute("href")).toBe("/en/scan/demo-evening");
});
