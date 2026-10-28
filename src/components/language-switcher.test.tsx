import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { LanguageSwitcher } from "@/components/language-switcher";

vi.mock("next/navigation", () => ({ usePathname: () => "/id/desain" }));

test("links to the same page in each language and marks the current one", () => {
  render(
    <LanguageSwitcher
      current="id"
      label="Bahasa"
      names={{ en: "English", id: "Bahasa Indonesia" }}
    />,
  );
  const english = screen.getByRole("link", { name: "English" });
  const indonesian = screen.getByRole("link", { name: "Bahasa Indonesia" });
  expect(english.getAttribute("href")).toBe("/en/desain");
  expect(indonesian.getAttribute("href")).toBe("/id/desain");
  expect(indonesian.getAttribute("aria-current")).toBe("true");
  expect(english.getAttribute("aria-current")).toBeNull();
});
