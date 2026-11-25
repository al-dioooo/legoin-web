import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { fill, plural } from "../src/i18n/format";
import { copyFor, LOCALES, signUp } from "./support";

/* Picture to LEGO (ADR-0012), on the mock: the note that the picture goes to
 * Anthropic before anything is chosen, the day's quota, a picture designed
 * through its stages, and the build with its model, its parts and what the
 * person has of them against a scan. Any picture will do for the mock, so the
 * spec uses one of the site's own sample photos.
 */
const PICTURE = join(__dirname, "../public/contoh/kepingan-satu.jpg");

for (const locale of LOCALES) {
  test(`a picture becomes a checked build, compared with a scan (${locale})`, async ({
    page,
  }) => {
    const copy = copyFor(locale);
    const { picture } = copy;

    await test.step("the header leads to the picture page", async () => {
      await signUp(page, locale);
      await page.getByRole("link", { name: copy.app.picture }).click();
      await expect(
        page.getByRole("heading", { level: 1, name: picture.title }),
      ).toBeVisible();
    });

    await test.step("the privacy note and the quota come before the upload", async () => {
      await page.goto(`/${locale}/picture?mockDelay=0`);
      await expect(
        page.getByRole("complementary", { name: picture.privacy.title }),
      ).toContainText("Anthropic");
      await expect(
        page.getByText(plural(picture.quota.left, 2, locale)),
      ).toBeVisible();
    });

    await test.step("choose a picture and design its build", async () => {
      const chooser = page.waitForEvent("filechooser");
      await page.getByRole("button", { name: picture.capture.choose }).click();
      await (await chooser).setFiles(PICTURE);
      await expect(
        page.getByRole("img", { name: picture.capture.previewAlt }),
      ).toBeVisible();
      await page.getByRole("button", { name: picture.capture.submit }).click();
      await expect(page).toHaveURL(
        new RegExp(`/${locale}/picture/pic_[a-z0-9]+$`),
      );
    });

    await test.step("the build shows its picture, model, parts and steps", async () => {
      const title = page.getByRole("heading", { level: 1 });
      await expect(title).toBeVisible();
      const name = (await title.textContent()) ?? "";
      await expect(
        page.getByRole("img", {
          name: fill(picture.result.previewAlt, { title: name }),
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: picture.result.model }),
      ).toHaveAttribute("download", "legoin-picture-build.ldr");
      await expect(
        page.getByRole("region", { name: picture.result.parts }),
      ).toBeVisible();
      await expect(
        page.getByRole("checkbox", {
          name: fill(copy.ideaDetail.markDone, { step: 1 }),
        }),
      ).toBeVisible();
    });

    await test.step("pick a scan to see what's missing", async () => {
      const scans = page.getByLabel(picture.result.check.label);
      await scans.selectOption({ index: 1 });
      await expect(
        page.getByRole("heading", { name: copy.ideaDetail.summary.title }),
      ).toBeVisible();
    });

    await test.step("the build is listed on the picture page, and a build is used", async () => {
      await page
        .getByRole("link", { name: picture.result.back })
        .first()
        .click();
      const list = page.getByRole("region", { name: picture.list.title });
      await expect(list.getByRole("link")).toHaveCount(1);
      await expect(
        page.getByText(plural(picture.quota.left, 1, locale)),
      ).toBeVisible();
    });
  });
}

test("a picture with nothing to build says so and offers another", async ({
  page,
}) => {
  const { picture } = copyFor("en");
  await signUp(page);
  await page.goto("/en/picture?mockDelay=0&mock=fail-picture_unusable");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: picture.capture.choose }).click();
  await (await chooser).setFiles(PICTURE);
  await page.getByRole("button", { name: picture.capture.submit }).click();

  const failure = page.getByRole("region", {
    name: picture.failures.picture_unusable.title,
  });
  await expect(failure).toBeVisible();
  await failure.getByRole("button", { name: picture.failures.other }).click();
  await expect(
    page.getByRole("button", { name: picture.capture.choose }),
  ).toBeVisible();
});
