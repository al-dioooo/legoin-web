import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { AccountMenu } from "@/components/auth/account-menu";
import { RequireAccount } from "@/components/auth/require-account";
import { en } from "@/i18n/dictionaries/en";
import { currentAccount, listScans, register } from "@/lib/api";
import { saveSession } from "@/lib/api/session";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const visit = (path: string) => window.history.replaceState(null, "", path);
const menuCopy = { account: en.app.account, logOut: en.app.logOut };

function Page() {
  return (
    <RequireAccount locale="en" checking={en.auth.checking}>
      <h1>History</h1>
    </RequireAccount>
  );
}

beforeEach(() => {
  localStorage.clear();
  replace.mockClear();
  visit("/en/history?mockDelay=0");
});

test("without a session the page shows nothing and goes to the log-in, to come back after", async () => {
  render(<Page />);
  expect(screen.queryByRole("heading")).toBeNull();
  expect(screen.getByRole("status").textContent).toBe(en.auth.checking);
  await waitFor(() =>
    expect(replace).toHaveBeenCalledWith(
      "/en/login?next=%2Fen%2Fhistory%3FmockDelay%3D0",
    ),
  );
});

test("with a session the page shows, and the menu says who's logged in", async () => {
  await register("ana@example.com", "baseplate-2x4");
  render(
    <>
      <AccountMenu copy={menuCopy} />
      <Page />
    </>,
  );
  expect(screen.getByRole("heading", { name: "History" })).toBeTruthy();
  expect(screen.getByText("Logged in as ana@example.com")).toBeTruthy();
  expect(replace).not.toHaveBeenCalled();
});

test("logging out from the menu sends the page to the log-in", async () => {
  await register("ana@example.com", "baseplate-2x4");
  render(
    <>
      <AccountMenu copy={menuCopy} />
      <Page />
    </>,
  );
  fireEvent.click(screen.getByRole("button", { name: en.app.logOut }));
  await waitFor(() => expect(screen.queryByRole("heading")).toBeNull());
  expect(currentAccount()).toBeNull();
  expect(screen.queryByRole("button", { name: en.app.logOut })).toBeNull();
  expect(replace).toHaveBeenCalledWith(
    "/en/login?next=%2Fen%2Fhistory%3FmockDelay%3D0",
  );
});

test("a session the backend no longer knows sends the page to the log-in on the next call", async () => {
  saveSession({
    token: "ended-elsewhere",
    expiresAt: "2999-01-01T00:00:00.000Z",
    account: {
      id: "acc_1",
      email: "ana@example.com",
      createdAt: "2026-11-25T00:00:00.000Z",
    },
  });
  render(<Page />);
  expect(screen.getByRole("heading", { name: "History" })).toBeTruthy();
  await act(() => listScans().catch(() => {}));
  expect(screen.queryByRole("heading")).toBeNull();
  await waitFor(() => expect(replace).toHaveBeenCalled());
});
