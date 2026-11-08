import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { ConfirmDelete } from "@/components/history/confirm-delete";

const copy = {
  action: "Delete",
  question: "Delete this scan? You can't get it back.",
  confirm: "Delete scan",
  keep: "Keep it",
};

const ask = () => {
  fireEvent.click(screen.getByRole("button", { name: /^Delete/ }));
  return screen.getByRole("group", { name: copy.question });
};

test("asks in place, with focus on keeping", () => {
  const onConfirm = vi.fn(async () => true);
  render(
    <ConfirmDelete copy={copy} context="26 October" onConfirm={onConfirm} />,
  );
  // The button says what it deletes.
  expect(
    screen.getByRole("button", { name: "Delete, 26 October" }),
  ).toBeDefined();

  ask();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Keep it" }),
  );
  expect(
    screen.getByRole("button", { name: "Delete scan, 26 October" }),
  ).toBeDefined();
  expect(onConfirm).not.toHaveBeenCalled();
});

test("Keep it and Escape both back out, focus returning to the button", () => {
  const onConfirm = vi.fn(async () => true);
  render(<ConfirmDelete copy={copy} onConfirm={onConfirm} />);

  ask();
  fireEvent.click(screen.getByRole("button", { name: "Keep it" }));
  expect(screen.queryByRole("group")).toBeNull();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Delete" }),
  );

  ask();
  fireEvent.keyDown(screen.getByRole("button", { name: "Keep it" }), {
    key: "Escape",
  });
  expect(screen.queryByRole("group")).toBeNull();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Delete" }),
  );
  expect(onConfirm).not.toHaveBeenCalled();
});

test("confirms once, and comes back to try again if deleting fails", async () => {
  let finish: (deleted: boolean) => void = () => {};
  const onConfirm = vi.fn(
    () => new Promise<boolean>((resolve) => (finish = resolve)),
  );
  render(<ConfirmDelete copy={copy} onConfirm={onConfirm} />);

  ask();
  const confirm = screen.getByRole("button", { name: "Delete scan" });
  fireEvent.click(confirm);
  fireEvent.click(confirm);
  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(confirm.getAttribute("aria-disabled")).toBe("true");

  finish(false);
  await waitFor(() => expect(screen.queryByRole("group")).toBeNull());
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Delete" }),
  );
});
