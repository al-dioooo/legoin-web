import type { Metadata } from "next";
import { PictureFlow } from "@/components/picture/picture-flow";
import { PictureList } from "@/components/picture/picture-list";
import { Sticker } from "@/components/ui/sticker";
import { currentLocale, getDictionary } from "@/i18n/dictionaries";
import { languageAlternates } from "@/i18n/locales";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: dict.picture.title,
    alternates: languageAlternates("/picture"),
  };
}

/**
 * Picture to LEGO (ADR-0012), laid out like the photo step: the title and the
 * upload plate on the left, the person's picture builds down the right,
 * overlapping it. On phones the list follows the upload.
 */
export default async function PicturePage() {
  const locale = await currentLocale();
  const { picture, scan } = await getDictionary();
  return (
    <div className="assemble grid gap-y-[calc(var(--stud)*2)] lg:grid-cols-12 lg:gap-x-stud">
      <header className="lg:col-span-8">
        <h1 className="pr-[4.5rem] font-display text-3xl leading-tight sm:pr-0 sm:text-5xl">
          <Sticker className="-rotate-2">{picture.title}</Sticker>
        </h1>
        <p className="mt-stud max-w-xl text-lg text-ink-secondary">
          {picture.lead}
        </p>
      </header>
      <div className="lg:col-span-8 lg:row-start-2">
        <PictureFlow
          copy={{
            privacy: picture.privacy,
            quota: picture.quota,
            capture: picture.capture,
            errors: picture.errors,
            progress: picture.progress,
            failures: picture.failures,
            generic: scan.errors.generic,
          }}
          locale={locale}
        />
      </div>
      <div className="lg:relative lg:z-10 lg:col-span-4 lg:col-start-9 lg:row-start-2 lg:-mt-[calc(var(--stud)*5)] lg:-ml-stud">
        <PictureList
          copy={{ list: picture.list, previewAlt: picture.result.previewAlt }}
          locale={locale}
        />
      </div>
    </div>
  );
}
