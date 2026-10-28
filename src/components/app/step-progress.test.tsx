import { render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { StepProgress } from "@/components/app/step-progress";

const navigation = vi.hoisted(() => ({ pathname: "/en/scan" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));

const labels = {
  label: "Scan progress",
  photo: "Photo",
  pieces: "Pieces",
  ideas: "Ideas",
};

beforeEach(() => {
  navigation.pathname = "/en/scan";
});

test("marks the current step and links only to steps already done", () => {
  navigation.pathname = "/en/scan/abc/ideas";
  render(<StepProgress labels={labels} />);
  expect(screen.getByRole("link", { name: /Photo/ }).getAttribute("href")).toBe(
    "/en/scan",
  );
  expect(
    screen.getByRole("link", { name: /Pieces/ }).getAttribute("href"),
  ).toBe("/en/scan/abc");
  expect(screen.queryByRole("link", { name: /Ideas/ })).toBeNull();
  expect(
    screen
      .getByText("Ideas")
      .closest("[aria-current]")
      ?.getAttribute("aria-current"),
  ).toBe("step");
});

test("nothing is reachable ahead of the photo step", () => {
  render(<StepProgress labels={labels} />);
  expect(screen.queryAllByRole("link")).toHaveLength(0);
});

test("stays hidden outside the scan flow", () => {
  navigation.pathname = "/en/history";
  const { container } = render(<StepProgress labels={labels} />);
  expect(container.firstChild).toBeNull();
});
