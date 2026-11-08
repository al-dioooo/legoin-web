import { expect, test } from "@playwright/test";
import { copyFor, startsWith } from "./support";

const en = copyFor("en");
const id = copyFor("id");

test("switching language on the ideas page keeps the theme", async ({
  page,
}) => {
  await page.goto("/en/scan/demo-desk/ideas?theme=animals&mockDelay=0");
  await expect(page.getByRole("article")).toHaveCount(3);

  const indonesian = page
    .getByRole("navigation", { name: en.language.label })
    .getByRole("link", { name: en.language.names.id });
  // The links pick up the query once the page hydrates.
  await expect(indonesian).toHaveAttribute("href", /[?&]theme=animals(&|$)/);
  await indonesian.click();

  await expect(page).toHaveURL(
    /\/id\/scan\/demo-desk\/ideas\?(.*&)?theme=animals(&|$)/,
  );
  await expect(
    page.getByRole("heading", { level: 1, name: id.ideas.title }),
  ).toBeVisible();
  await expect(
    page.getByRole("radio", {
      name: startsWith(id.ideas.picker.themes.animals.label),
    }),
  ).toBeChecked();
  await expect(page.getByRole("article")).toHaveCount(3);
});
