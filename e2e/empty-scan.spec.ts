import { expect, test } from "@playwright/test";
import { copyFor } from "./support";

const copy = copyFor("en");

test("removing every piece leaves an empty state and no way to ideas", async ({
  page,
}) => {
  // The one-piece demo scan.
  await page.goto("/en/scan/demo-single?mockDelay=0");
  const inventory = page.getByRole("region", { name: copy.common.inventory });
  const piece = page.getByRole("region", { name: copy.results.piece.title });
  const tiles = inventory.getByRole("list").getByRole("button");
  await expect(tiles).toHaveCount(1);

  await tiles.click();
  await piece.getByRole("button", { name: copy.results.edit.remove }).click();
  await piece
    .getByRole("button", { name: copy.results.edit.confirmRemove, exact: true })
    .click();

  const emptyState = inventory.getByRole("heading", {
    name: copy.results.empty.title,
  });
  await expect(emptyState).toBeVisible();
  await expect(emptyState).toBeFocused();
  const getIdeas = page.getByRole("button", { name: copy.results.continue });
  await expect(getIdeas).toBeDisabled();
  await expect(getIdeas).toHaveAccessibleDescription(
    copy.results.empty.continueHint,
  );
  await expect(
    page.getByRole("link", { name: copy.results.continue }),
  ).toHaveCount(0);

  // Saved, not just shown.
  await page.reload();
  await expect(emptyState).toBeVisible();
  await expect(getIdeas).toBeDisabled();
});
