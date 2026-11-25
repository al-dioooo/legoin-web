import { expect, test } from "@playwright/test";
import {
  copyFor,
  fillAccountForm,
  LOCALES,
  newEmail,
  PASSWORD,
} from "./support";

/* Logging in (ADR-0011): pages that scan or show scans send a visitor with
 * no session to the log-in and back again, and logging out ends it. The mock
 * keeps the accounts in this test's browser.
 */
for (const locale of LOCALES) {
  test(`history needs a log-in, and a new account comes back to it (${locale})`, async ({
    page,
  }) => {
    const copy = copyFor(locale);
    const history = page.getByRole("heading", {
      level: 1,
      name: copy.history.title,
    });
    const logInPage = page.getByRole("heading", {
      level: 1,
      name: copy.auth.login.title,
    });
    const email = newEmail();

    await test.step("history sends a visitor to the log-in", async () => {
      await page.goto(`/${locale}/history?mockDelay=0`);
      await expect(logInPage).toBeVisible();
      await expect(page).toHaveURL(
        `/${locale}/login?next=${encodeURIComponent(`/${locale}/history?mockDelay=0`)}`,
      );
    });

    await test.step("making an account opens history, with the demo scans", async () => {
      await page
        .getByRole("link", { name: copy.auth.login.switchLink })
        .click();
      await expect(
        page.getByRole("heading", { level: 1, name: copy.auth.register.title }),
      ).toBeVisible();
      await fillAccountForm(page, locale, "register", email, PASSWORD);
      await expect(history).toBeVisible();
      await expect(page).toHaveURL(`/${locale}/history?mockDelay=0`);
      await expect(page.getByRole("listitem").first()).toBeVisible();
    });

    await test.step("logging out goes to the log-in, and history needs it again", async () => {
      await page.getByRole("button", { name: copy.app.logOut }).click();
      await expect(logInPage).toBeVisible();
      await page.goto(`/${locale}/history?mockDelay=0`);
      await expect(logInPage).toBeVisible();
    });

    await test.step("a wrong password says so; the right one opens history", async () => {
      await fillAccountForm(page, locale, "login", email, "wrong-password");
      await expect(
        page
          .getByRole("form", { name: copy.auth.login.title })
          .getByRole("alert"),
      ).toHaveText(copy.auth.errors.invalid_credentials);
      await fillAccountForm(page, locale, "login", email, PASSWORD);
      await expect(history).toBeVisible();
    });
  });
}
