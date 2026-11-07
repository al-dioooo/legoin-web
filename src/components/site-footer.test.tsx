import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { SiteFooter } from "@/components/site-footer";
import { en } from "@/i18n/dictionaries/en";
import { id } from "@/i18n/dictionaries/id";

function renderFooter(locale: "en" | "id") {
  const dict = locale === "en" ? en : id;
  render(
    <SiteFooter
      copy={{ ...dict.footer, designSystem: dict.meta.designSystem }}
      locale={locale}
    />,
  );
  return screen.getByRole("contentinfo");
}

test("credits the dataset with its citation, DOI and license", () => {
  const footer = renderFooter("en");
  const dataset = within(footer).getByRole("region", { name: "Dataset" });
  expect(dataset.textContent).toContain(
    "Zawora, K., Zaraziński, S., Śledź, B., & Łobacz, B. (2021). Tagged images with LEGO bricks. MOST Wiedzy, Gdańsk University of Technology.",
  );
  expect(
    within(dataset)
      .getByRole("link", { name: "https://doi.org/10.34808/anq4-rn44" })
      .getAttribute("href"),
  ).toBe("https://doi.org/10.34808/anq4-rn44");
  expect(
    within(dataset)
      .getByRole("link", { name: "CC BY 4.0" })
      .getAttribute("href"),
  ).toBe("https://creativecommons.org/licenses/by/4.0/");
});

test("credits the team and course, and carries the photo and trademark notes", () => {
  const footer = renderFooter("en");
  const team = within(footer).getByRole("region", { name: "Team" });
  expect(team.textContent).toContain(
    "Made by Kelompok 5 for the Visual Komputer Cerdas course, School of Vocational Studies, IPB University.",
  );
  expect(within(team).getAllByRole("listitem")).toHaveLength(3);
  expect(footer.textContent).toContain("AI-generated");
  expect(footer.textContent).toContain(
    "isn't affiliated with or endorsed by the LEGO Group",
  );
  expect(
    within(footer)
      .getByRole("link", { name: "Design system" })
      .getAttribute("href"),
  ).toBe("/en/desain");
});

test("reads in Indonesian and links within /id", () => {
  const footer = renderFooter("id");
  const team = within(footer).getByRole("region", { name: "Tim" });
  expect(team.textContent).toContain(
    "Dibuat oleh Kelompok 5 untuk mata kuliah Visual Komputer Cerdas, Sekolah Vokasi IPB University.",
  );
  expect(footer.textContent).toContain("merek dagang LEGO Group");
  expect(
    within(footer).getByRole("link", { name: "CC BY 4.0" }).parentElement
      ?.textContent,
  ).toBe("Berlisensi CC BY 4.0.");
  expect(
    within(footer)
      .getByRole("link", { name: id.meta.designSystem })
      .getAttribute("href"),
  ).toBe("/id/desain");
});
