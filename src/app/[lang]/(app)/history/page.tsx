import type { Metadata } from "next";
import { ScanHistory } from "@/components/history/scan-history";
import { Sticker } from "@/components/ui/sticker";
import { currentLocale, getDictionary } from "@/i18n/dictionaries";
import { languageAlternates } from "@/i18n/locales";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: dict.history.title,
    alternates: languageAlternates("/history"),
  };
}

/**
 * Past scans (PRD F8). A static shell: scans live in the browser, so the list
 * loads on the client through the data layer.
 */
export default async function HistoryPage() {
  const locale = await currentLocale();
  const { history, ideas, common } = await getDictionary();
  const copy = { history, themes: ideas.picker.themes, pieces: common.pieces };
  return (
    <section aria-labelledby="history-title" className="max-w-5xl">
      <div className="click-in">
        <h1
          id="history-title"
          className="font-display text-3xl leading-tight sm:text-5xl"
        >
          <Sticker className="-rotate-2">{history.title}</Sticker>
        </h1>
        <p className="mt-stud max-w-xl text-lg text-ink-secondary">
          {history.lead}
        </p>
      </div>
      <ScanHistory copy={copy} locale={locale} />
    </section>
  );
}
