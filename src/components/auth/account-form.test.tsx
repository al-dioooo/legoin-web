import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { AccountForm } from "@/components/auth/account-form";
import { en } from "@/i18n/dictionaries/en";
import { id } from "@/i18n/dictionaries/id";
import { currentAccount, logOut, register } from "@/lib/api";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(window.location.search),
}));

const visit = (path: string) => window.history.replaceState(null, "", path);

beforeEach(() => {
  localStorage.clear();
  replace.mockClear();
  visit("/en/register");
});

/** The text of everything that describes `element`, as a screen reader reads it. */
function description(element: HTMLElement) {
  return (element.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter(Boolean)
    .map((ref) => document.getElementById(ref)?.textContent)
    .join(" ");
}

function fillIn(email: string, password: string, dict = en) {
  fireEvent.change(screen.getByLabelText(dict.auth.email), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(dict.auth.password), {
    target: { value: password },
  });
}

test("fields that break the rules say why, get focus and send nothing", async () => {
  render(<AccountForm mode="register" copy={en.auth} locale="en" />);
  fillIn("ana", "short");
  fireEvent.click(
    screen.getByRole("button", { name: en.auth.register.submit }),
  );
  const email = screen.getByLabelText(en.auth.email);
  expect(document.activeElement).toBe(email);
  expect(email.getAttribute("aria-invalid")).toBe("true");
  expect(description(email)).toBe(en.auth.errors.email);
  expect(description(screen.getByLabelText(en.auth.password))).toBe(
    `${en.auth.errors.passwordShort} ${en.auth.passwordHint}`,
  );
  expect(currentAccount()).toBeNull();
  expect(replace).not.toHaveBeenCalled();
});

test("making an account logs it in and opens the page it came for", async () => {
  visit("/en/register?next=%2Fen%2Fhistory");
  render(<AccountForm mode="register" copy={en.auth} locale="en" />);
  fillIn("Ana@Example.com", "baseplate-2x4");
  fireEvent.click(
    screen.getByRole("button", { name: en.auth.register.submit }),
  );
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/en/history"));
  expect(currentAccount()?.email).toBe("ana@example.com");
});

test("a next that isn't a page here opens scanning instead", async () => {
  visit("/en/register?next=%2F%2Fevil.example");
  render(<AccountForm mode="register" copy={en.auth} locale="en" />);
  fillIn("ana@example.com", "baseplate-2x4");
  fireEvent.click(
    screen.getByRole("button", { name: en.auth.register.submit }),
  );
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/en/scan"));
});

test("a wrong password says so, in the page's language, and can be tried again", async () => {
  await register("ana@example.com", "baseplate-2x4");
  await logOut();
  visit("/id/login");
  render(<AccountForm mode="login" copy={id.auth} locale="id" />);
  fillIn("ana@example.com", "wrong-password", id);
  fireEvent.click(screen.getByRole("button", { name: id.auth.login.submit }));
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toBe(
      id.auth.errors.invalid_credentials,
    ),
  );
  expect(replace).not.toHaveBeenCalled();
  fillIn("ana@example.com", "baseplate-2x4", id);
  fireEvent.click(screen.getByRole("button", { name: id.auth.login.submit }));
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/id/scan"));
});

test("an email that already has an account says to log in instead", async () => {
  await register("ana@example.com", "baseplate-2x4");
  await logOut();
  render(<AccountForm mode="register" copy={en.auth} locale="en" />);
  fillIn("ana@example.com", "another-password");
  fireEvent.click(
    screen.getByRole("button", { name: en.auth.register.submit }),
  );
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toBe(
      en.auth.errors.email_taken,
    ),
  );
});

test("logging in takes any password that's there; the link to make an account keeps next", () => {
  visit("/en/login?next=%2Fen%2Fscan%2Fdemo-desk");
  render(<AccountForm mode="login" copy={en.auth} locale="en" />);
  expect(
    screen
      .getByRole("link", { name: en.auth.login.switchLink })
      .getAttribute("href"),
  ).toBe("/en/register?next=%2Fen%2Fscan%2Fdemo-desk");
  expect(
    screen.getByLabelText(en.auth.password).getAttribute("autocomplete"),
  ).toBe("current-password");
  fillIn("ana@example.com", "");
  fireEvent.click(screen.getByRole("button", { name: en.auth.login.submit }));
  expect(description(screen.getByLabelText(en.auth.password))).toBe(
    en.auth.errors.passwordMissing,
  );
});
