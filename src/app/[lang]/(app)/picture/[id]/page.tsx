import type { Metadata } from "next";
import { Suspense } from "react";
import {
  PictureResult,
  PictureResultLoading,
} from "@/components/picture/picture-result";
import { currentLocale, getDictionary } from "@/i18n/dictionaries";
import { languageAlternates } from "@/i18n/locales";
import { UrlMetadataMarker } from "@/i18n/url-metadata";

// Reads `params` so hreflang points at this build; the page renders
// `UrlMetadataMarker` to say so.
export async function generateMetadata({
  params,
}: PageProps<"/[lang]/picture/[id]">): Promise<Metadata> {
  const dict = await getDictionary();
  const { id } = await params;
  return {
    title: dict.picture.result.title,
    alternates: languageAlternates(`/picture/${encodeURIComponent(id)}`),
  };
}

/**
 * One picture build. Builds are read in the browser through the data layer,
 * so the page is a static shell and the client reads the id from the URL.
 */
export default async function PictureResultPage() {
  const locale = await currentLocale();
  const { picture, ideaDetail, common } = await getDictionary();
  const copy = {
    result: picture.result,
    summary: ideaDetail.summary,
    steps: {
      markDone: ideaDetail.markDone,
      progress: ideaDetail.progress,
      allDone: ideaDetail.allDone,
    },
    common: {
      step: common.step,
      pieces: common.pieces,
      partsUsed: common.partsUsed,
      partsMissing: common.partsMissing,
    },
  };
  return (
    <>
      <Suspense
        fallback={<PictureResultLoading label={picture.result.loading} />}
      >
        <PictureResult copy={copy} locale={locale} />
      </Suspense>
      <UrlMetadataMarker />
    </>
  );
}
