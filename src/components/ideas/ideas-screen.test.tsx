import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { IdeasScreen } from "@/components/ideas/ideas-screen";
import { en } from "@/i18n/dictionaries/en";
import { id } from "@/i18n/dictionaries/id";
import { getIdeas, getScan, resetMockData } from "@/lib/mock/api";

const route = vi.hoisted(() => ({ id: "demo-evening", search: "" }));
const push = vi.fn();
const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: route.id }),
  useSearchParams: () => new URLSearchParams(route.search),
  useRouter: () => ({ push, replace }),
}));

const copy = {
  ideas: en.ideas,
  results: { loading: en.results.loading, missing: en.results.missing },
};

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
  render(
    <IdeasScreen
      copy={{
        ideas: id.ideas,
        results: { loading: id.results.loading, missing: id.results.missing },
      }}
      locale="id"
    />,
  );
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
