import { expect, test } from "@playwright/test";
import { copyFor, LOCALES } from "./support";

for (const locale of LOCALES) {
  test(`an unknown page is a 404 with a way home (${locale})`, async ({
    page,
  }) => {
    const copy = copyFor(locale);
    const response = await page.goto(`/${locale}/does-not-exist`);
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: copy.states.notFound.title,
      }),
    ).toBeVisible();

    await page
      .getByRole("link", { name: copy.states.notFound.home, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/${locale}$`));
  });
}
