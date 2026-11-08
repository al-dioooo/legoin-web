import { expect, test } from "@playwright/test";
import { copyFor } from "./support";

const copy = copyFor("en");

/* `?mock=fail-<reason>` makes every scan on the page fail. To retry, the test
 * drops it from the URL, the way the trouble would clear up for real: a
 * connection comes back, or a new photo is fine.
 */
const REASONS = ["no_pieces", "too_dark", "too_blurry", "network"] as const;

for (const reason of REASONS) {
  test(`a scan that fails with ${reason} says why and can be retried`, async ({
    page,
  }) => {
    const message = copy.scan.failures[reason];
    await page.goto(`/en/scan?mock=fail-${reason}&mockDelay=0`);
    await page.getByRole("button", { name: copy.scan.capture.sample }).click();
    await page.getByRole("button", { name: copy.scan.capture.submit }).click();

    const failure = page.getByRole("region", { name: message.title });
    await expect(failure).toBeVisible();
    await expect(failure).toContainText(message.body);

    await page.evaluate(() =>
      window.history.replaceState(null, "", "?mockDelay=0"),
    );
    if (reason === "network") {
      // The photo is still there, so the same scan runs again.
      await failure
        .getByRole("button", { name: copy.scan.failures.retry })
        .click();
    } else {
      // The photo was the problem: only a new one helps.
      await expect(
        failure.getByRole("button", { name: copy.scan.failures.retry }),
      ).toHaveCount(0);
      await failure
        .getByRole("button", { name: copy.scan.failures.retake })
        .click();
      await page
        .getByRole("button", { name: copy.scan.capture.sample })
        .click();
      await page
        .getByRole("button", { name: copy.scan.capture.submit })
        .click();
    }

    await expect(
      page.getByRole("heading", { level: 1, name: copy.results.title }),
    ).toBeVisible();
  });
}
