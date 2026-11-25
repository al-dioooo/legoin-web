import { expect, test } from "@playwright/test";
import { copyFor, LOCALES, signUp, startsWith } from "./support";

/* Ideas built from the scan (ADR-0013), as the API answers with
 * LEGOIN_SCAN_BUILDS: each idea holds its card's place while it's built, and
 * clicks in when it's done. `mockBuilds` has the mock finish the first 3 s
 * after the ideas are asked for, and the others a quarter of that apart; the
 * screen reads the scan again every 3 s.
 */
const BUILDS = "mockDelay=0&mockBuilds=3000";
const BUILT = { timeout: 15_000 };

for (const locale of LOCALES) {
  test(`ideas built from the scan click in on the list (${locale})`, async ({
    page,
  }) => {
    const copy = copyFor(locale);
    // Visible ones only: Next keeps pages it navigated away from, hidden.
    const building = page
      .getByText(copy.ideas.building.card)
      .filter({ visible: true });
    const cards = page.getByRole("article");
    await signUp(page, locale);

    await page.goto(
      `/${locale}/scan/demo-evening/ideas?theme=vehicles&${BUILDS}`,
    );
    await expect(building).toHaveCount(3);
    await expect(cards).toHaveCount(0);

    await expect(cards).toHaveCount(3, BUILT);
    await expect(building).toHaveCount(0);
    await expect(cards.getByRole("img")).toHaveCount(3);

    const first = cards.first();
    const title = await first.getByRole("heading").textContent();
    await first
      .getByRole("link", { name: startsWith(copy.ideas.seeSteps) })
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: title ?? "" }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: copy.ideaDetail.steps }),
    ).toBeVisible();
  });
}

test("the scan step says where the photo goes before anything is uploaded", async ({
  page,
}) => {
  const copy = copyFor("en");
  await signUp(page);
  await page.goto("/en/scan?mockDelay=0");
  await expect(page.getByText(copy.scan.capture.privacy)).toBeVisible();
});
