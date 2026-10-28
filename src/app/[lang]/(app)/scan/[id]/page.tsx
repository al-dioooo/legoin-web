import type { Metadata } from "next";
import { Suspense } from "react";
import { ResultsLoading, ScanSummary } from "@/components/results/scan-summary";
import { currentLocale, getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.results.title };
}

/**
 * Pieces step. Scans live in the browser (mock service), so the page is a
 * static shell and the client reads the scan id from the URL.
 */
export default async function ScanResultsPage() {
  const locale = await currentLocale();
  const { results, common } = await getDictionary();
  return (
    <Suspense fallback={<ResultsLoading label={results.loading} />}>
      <ScanSummary copy={{ results, common }} locale={locale} />
    </Suspense>
  );
}
