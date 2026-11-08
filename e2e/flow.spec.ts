import { expect, test } from "@playwright/test";
import { copyFor, LOCALES, startsWith } from "./support";

/* The whole flow, clicked through as a person would: photo, scan, results and
 * a correction, a theme and three ideas, an idea's steps, then the scan in
 * history, deleted. The app's own links don't carry the demo options, so the
 * scan and the ideas take the mock's normal pace (a few seconds in all).
 */
for (const locale of LOCALES) {
  test(`scan, correct, get ideas and delete from history (${locale})`, async ({
    page,
  }) => {
    const copy = copyFor(locale);

    await test.step("home leads to the scan step", async () => {
      await page.goto(`/${locale}`);
      await page.getByRole("link", { name: copy.home.ctaScan }).click();
      await expect(
        page.getByRole("heading", { level: 1, name: copy.scan.title }),
      ).toBeVisible();
    });

    await test.step("scan the sample photo", async () => {
      await page
        .getByRole("button", { name: copy.scan.capture.sample })
        .click();
      await expect(
        page.getByRole("img", { name: copy.scan.capture.sampleAlt }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: copy.scan.capture.submit })
        .click();
      await expect(
        page.getByRole("heading", { name: copy.scan.progress.title }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 1, name: copy.results.title }),
      ).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`/${locale}/scan/[a-z0-9]+$`));
    });

    await test.step("correct one piece's color", async () => {
      const inventory = page.getByRole("region", {
        name: copy.common.inventory,
      });
      const piece = page.getByRole("region", {
        name: copy.results.piece.title,
      });
      const firstLine = inventory.getByRole("list").getByRole("button").first();
      await firstLine.click();
      await expect(firstLine).toHaveAttribute("aria-pressed", "true");
      const color = piece.getByLabel(copy.results.edit.color);
      const newColor = (await color.inputValue()) === "red" ? "blue" : "red";
      await color.selectOption(newColor);
      await piece.getByRole("button", { name: copy.results.edit.save }).click();
      await expect(inventory.getByRole("status")).toHaveText(
        copy.results.status.edited,
      );
      await expect(
        inventory.getByRole("list").getByRole("button", { pressed: true }),
      ).toContainText(copy.results.edit.edited);
    });

    await test.step("pick a theme and get three ideas", async () => {
      await page.getByRole("link", { name: copy.results.continue }).click();
      await expect(
        page.getByRole("heading", { level: 1, name: copy.ideas.picker.title }),
      ).toBeVisible();
      const animals = page.getByRole("radio", {
        name: startsWith(copy.ideas.picker.themes.animals.label),
      });
      // The radio is visually hidden and its card takes the pointer, so pick
      // it the way a keyboard does.
      await animals.press("Space");
      await expect(animals).toBeChecked();
      await page
        .getByRole("button", { name: copy.ideas.picker.submit })
        .click();
      await expect(page).toHaveURL(/[?&]theme=animals(&|$)/);
      await expect(page.getByRole("article")).toHaveCount(3);
    });

    const titles = await page
      .getByRole("article")
      .getByRole("heading")
      .allTextContents();

    await test.step("see one idea's steps, then the next idea", async () => {
      await page
        .getByRole("article", { name: titles[0] })
        .getByRole("link", { name: startsWith(copy.ideas.seeSteps) })
        .click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        titles[0],
      );
      await expect(
        page.getByRole("region", { name: copy.ideaDetail.steps }),
      ).toBeVisible();
      await page
        .getByRole("navigation", { name: copy.ideaDetail.nav })
        .getByRole("link", { name: startsWith(copy.ideaDetail.next) })
        .click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        titles[1],
      );
    });

    await test.step("history lists the scan and its ideas", async () => {
      await page
        .getByRole("link", { name: copy.app.history, exact: true })
        .click();
      await expect(
        page.getByRole("heading", { level: 1, name: copy.history.title }),
      ).toBeVisible();
      // The four demo scans and this one.
      await expect(page.getByRole("article")).toHaveCount(5);
      const ideaList = page.getByRole("list", {
        name: copy.history.ideaList,
      });
      await expect(ideaList).toHaveCount(1);
      for (const title of titles) {
        await expect(
          ideaList.getByRole("link", { name: startsWith(title) }),
        ).toBeVisible();
      }
    });

    await test.step("delete the scan after confirming", async () => {
      const scan = page.getByRole("article").filter({
        has: page.getByRole("list", { name: copy.history.ideaList }),
      });
      await scan
        .getByRole("button", { name: startsWith(copy.history.delete.action) })
        .click();
      await scan
        .getByRole("group", { name: copy.history.delete.question })
        .getByRole("button", {
          name: startsWith(copy.history.delete.confirm),
        })
        .click();
      await expect(page.getByRole("status")).toHaveText(
        copy.history.delete.done,
      );
      await expect(page.getByRole("article")).toHaveCount(4);
      await expect(scan).toHaveCount(0);

      // Deleted for good, not just from the screen.
      await page.reload();
      await expect(page.getByRole("article")).toHaveCount(4);
    });
  });
}
