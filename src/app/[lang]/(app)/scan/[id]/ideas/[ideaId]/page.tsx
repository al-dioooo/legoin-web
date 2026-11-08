import type { Metadata } from "next";
import { Suspense } from "react";
import { IdeaDetail, IdeaDetailLoading } from "@/components/ideas/idea-detail";
import { currentLocale, getDictionary } from "@/i18n/dictionaries";
import { languageAlternates } from "@/i18n/locales";
import { UrlMetadataMarker } from "@/i18n/url-metadata";

// Reads `params` so hreflang points at this idea; the page renders
// `UrlMetadataMarker` to say so.
export async function generateMetadata({
  params,
}: PageProps<"/[lang]/scan/[id]/ideas/[ideaId]">): Promise<Metadata> {
  const dict = await getDictionary();
  const { id, ideaId } = await params;
  return {
    title: dict.ideaDetail.title,
    alternates: languageAlternates(
      `/scan/${encodeURIComponent(id)}/ideas/${encodeURIComponent(ideaId)}`,
    ),
  };
}

/**
 * One idea's parts and steps, still the ideas step. Ideas are kept with the
 * scan in the browser (mock service), so the page is a static shell and the
 * client reads the ids and `?theme=` from the URL.
 */
export default async function IdeaDetailPage() {
  const locale = await currentLocale();
  const { ideaDetail, ideas, results, common } = await getDictionary();
  const copy = {
    ideaDetail,
    ideas: {
      difficulty: ideas.difficulty,
      complete: ideas.complete,
      usesNone: ideas.usesNone,
    },
    themes: ideas.picker.themes,
    results: { missing: results.missing },
    common: {
      ideaOf: common.ideaOf,
      missingCount: common.missingCount,
      partsUsed: common.partsUsed,
      partsMissing: common.partsMissing,
      step: common.step,
    },
  };
  return (
    <>
      <Suspense fallback={<IdeaDetailLoading label={ideaDetail.loading} />}>
        <IdeaDetail copy={copy} locale={locale} />
      </Suspense>
      <UrlMetadataMarker />
    </>
  );
}
