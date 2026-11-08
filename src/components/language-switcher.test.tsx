import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { LanguageSwitcher } from "@/components/language-switcher";

const url = vi.hoisted(() => ({ pathname: "/id/desain", search: "" }));

vi.mock("next/navigation", () => ({
  usePathname: () => url.pathname,
  useSearchParams: () => new URLSearchParams(url.search),
}));

afterEach(() => {
  url.pathname = "/id/desain";
  url.search = "";
  window.history.replaceState(null, "", "/");
});

function renderSwitcher() {
  render(
    <LanguageSwitcher
      current="id"
      label="Bahasa"
      names={{ en: "English", id: "Bahasa Indonesia" }}
    />,
  );
  return {
    english: screen.getByRole("link", { name: "English" }),
    indonesian: screen.getByRole("link", { name: "Bahasa Indonesia" }),
  };
}

test("links to the same page in each language and marks the current one", () => {
  const { english, indonesian } = renderSwitcher();
  expect(english.getAttribute("href")).toBe("/en/desain");
  expect(indonesian.getAttribute("href")).toBe("/id/desain");
  expect(indonesian.getAttribute("aria-current")).toBe("true");
  expect(english.getAttribute("aria-current")).toBeNull();
});

// Without the query, the ideas page forgets its theme and shows the picker.
test("keeps the query and the hash", () => {
  url.pathname = "/id/scan/demo-evening/ideas";
  url.search = "theme=animals&mockDelay=0";
  window.history.replaceState(null, "", "#idea-2");

  const { english, indonesian } = renderSwitcher();
  expect(english.getAttribute("href")).toBe(
    "/en/scan/demo-evening/ideas?theme=animals&mockDelay=0#idea-2",
  );
  expect(indonesian.getAttribute("href")).toBe(
    "/id/scan/demo-evening/ideas?theme=animals&mockDelay=0#idea-2",
  );
});

test("follows the hash as it changes", () => {
  url.pathname = "/id/scan";
  url.search = "mock=fail-too_dark";
  const { english } = renderSwitcher();
  expect(english.getAttribute("href")).toBe("/en/scan?mock=fail-too_dark");

  act(() => {
    window.history.replaceState(null, "", "#photo-tips");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
  expect(english.getAttribute("href")).toBe(
    "/en/scan?mock=fail-too_dark#photo-tips",
  );
});
