import type { Metadata } from "next";
import { Suspense } from "react";
import { ResultsLoading, ScanResults } from "@/components/results/scan-results";
import { currentLocale, getDictionary } from "@/i18n/dictionaries";
import { languageAlternates } from "@/i18n/locales";
import { UrlMetadataMarker } from "@/i18n/url-metadata";

// Reads `params` so hreflang points at this scan; the page renders
// `UrlMetadataMarker` to say so.
export async function generateMetadata({
  params,
}: PageProps<"/[lang]/scan/[id]">): Promise<Metadata> {
  const dict = await getDictionary();
  const { id } = await params;
  return {
    title: dict.results.title,
    alternates: languageAlternates(`/scan/${encodeURIComponent(id)}`),
  };
}

/**
 * Pieces step. Scans live in the browser (mock service), so the page is a
 * static shell and the client reads the scan id from the URL.
 */
export default async function ScanResultsPage() {
  const locale = await currentLocale();
  const { results, common } = await getDictionary();
  return (
    <>
      <Suspense fallback={<ResultsLoading label={results.loading} />}>
        <ScanResults copy={{ results, common }} locale={locale} />
      </Suspense>
      <UrlMetadataMarker />
    </>
  );
}
