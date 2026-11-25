import { expect, test } from "@playwright/test";
import { fill } from "../src/i18n/format";
import { copyFor, LOCALES, signUp, startsWith } from "./support";

/* Previews of ideas (ADR-0012, "Idea previews"), as the API builds them with
 * LEGOIN_IDEA_PREVIEWS=all: ideas come with a placeholder where their picture
 * goes, and the picture clicks in when it's built. `mockPreviews` has the mock
 * build each one 3 s after the ideas, time enough to open one before it's
 * built; the screens read again every 3 s.
 */
const PREVIEWS = "mockDelay=0&mockPreviews=3000";
const BUILT = { timeout: 15_000 };

for (const locale of LOCALES) {
  test(`idea previews click in on the list and the idea page (${locale})`, async ({
    page,
  }) => {
    const copy = copyFor(locale);
    // Visible ones only: Next keeps the list, hidden, behind the idea page.
    const pending = page
      .getByText(copy.ideas.preview.pending)
      .filter({ visible: true });
    await signUp(page, locale);

    await test.step("the list holds each picture's place, then shows it", async () => {
      await page.goto(
        `/${locale}/scan/demo-evening/ideas?theme=vehicles&${PREVIEWS}`,
      );
      const cards = page.getByRole("article");
      await expect(cards).toHaveCount(3);
      await expect(pending).toHaveCount(3);
      await expect(cards.getByRole("img")).toHaveCount(0);

      await expect(cards.getByRole("img")).toHaveCount(3, BUILT);
      await expect(pending).toHaveCount(0);
    });

    await test.step("other ideas start again, and the idea page waits too", async () => {
      await page.getByRole("button", { name: copy.ideas.again }).click();
      await expect(pending).toHaveCount(3);
      const first = page.getByRole("article").first();
      const title = await first.getByRole("heading").textContent();
      await first
        .getByRole("link", { name: startsWith(copy.ideas.seeSteps) })
        .click();

      await expect(
        page.getByRole("heading", { level: 1, name: title ?? "" }),
      ).toBeVisible();
      await expect(pending).toBeVisible();
      await expect(
        page.getByRole("img", {
          name: fill(copy.ideas.preview.alt, { title: title ?? "" }),
        }),
      ).toBeVisible(BUILT);
      await expect(pending).toHaveCount(0);
      await expect(page.getByText(copy.ideas.preview.updated)).toBeVisible();
      await expect(
        page.getByRole("region", { name: copy.ideaDetail.steps }),
      ).toBeVisible();
    });
  });
}
