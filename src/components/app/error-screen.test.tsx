import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { ErrorScreen } from "@/components/app/error-screen";

const route = vi.hoisted(() => ({ params: {} as { lang?: string } }));
vi.mock("next/navigation", () => ({ useParams: () => route.params }));

beforeEach(() => {
  route.params = { lang: "en" };
});

test("offers a retry and a way home, and announces the error first", () => {
  const retry = vi.fn();
  render(<ErrorScreen retry={retry} />);

  const title = screen.getByRole("heading", {
    level: 1,
    name: "Something went wrong",
  });
  expect(document.activeElement).toBe(title);

  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(retry).toHaveBeenCalledOnce();
  expect(
    screen.getByRole("link", { name: "Back to home" }).getAttribute("href"),
  ).toBe("/en");
});

test("speaks the language in the URL", () => {
  route.params = { lang: "id" };
  render(<ErrorScreen retry={() => {}} />);
  expect(screen.getByRole("heading", { name: "Ada yang salah" })).toBeDefined();
  expect(screen.getByRole("button", { name: "Coba lagi" })).toBeDefined();
  expect(
    screen
      .getByRole("link", { name: "Kembali ke beranda" })
      .getAttribute("href"),
  ).toBe("/id");
  expect(
    screen.getByRole("link", { name: "Beranda Legoin" }).getAttribute("href"),
  ).toBe("/id");
});

test("falls back to English when the URL has no language", () => {
  route.params = { lang: "fr" };
  render(<ErrorScreen retry={() => {}} />);
  expect(
    screen.getByRole("heading", { name: "Something went wrong" }),
  ).toBeDefined();
  expect(
    screen.getByRole("link", { name: "Legoin home" }).getAttribute("href"),
  ).toBe("/en");
});
