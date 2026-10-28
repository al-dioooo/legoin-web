import type { Metadata } from "next";
import { Suspense } from "react";
import { IdeasLoading, IdeasScreen } from "@/components/ideas/ideas-screen";
import { currentLocale, getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.ideas.title };
}

/**
 * Ideas step. Like the pieces step it's a static shell: the client reads the
 * scan id and `?theme=` from the URL and the scan from the mock service.
 */
export default async function IdeasPage() {
  const locale = await currentLocale();
  const { ideas, results } = await getDictionary();
  const copy = {
    ideas,
    results: { loading: results.loading, missing: results.missing },
  };
  return (
    <Suspense fallback={<IdeasLoading label={results.loading} />}>
      <IdeasScreen copy={copy} locale={locale} />
    </Suspense>
  );
}
