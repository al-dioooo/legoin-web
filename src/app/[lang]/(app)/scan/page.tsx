import type { Metadata } from "next";
import { CaptureFlow } from "@/components/scan/capture-flow";
import { PhotoGuide } from "@/components/scan/photo-guide";
import { Sticker } from "@/components/ui/sticker";
import { currentLocale, getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.scan.title };
}

/**
 * Photo step, laid out like a booklet page: the title sticker and the capture
 * plate on the left, the tips stacked down the right and overlapping the plate.
 * On phones the tips follow the capture plate.
 */
export default async function ScanPage() {
  const locale = await currentLocale();
  const { scan } = await getDictionary();
  return (
    <div className="assemble grid gap-y-[calc(var(--stud)*2)] lg:grid-cols-12 lg:gap-x-stud">
      <header className="lg:col-span-8">
        <h1 className="pr-[4.5rem] font-display text-3xl leading-tight sm:pr-0 sm:text-5xl">
          <Sticker className="-rotate-2">{scan.title}</Sticker>
        </h1>
        <p className="mt-stud max-w-xl text-lg text-ink-secondary">
          {scan.lead}
        </p>
      </header>
      <div className="lg:col-span-8 lg:row-start-2">
        <CaptureFlow
          copy={{
            capture: scan.capture,
            errors: scan.errors,
            progress: scan.progress,
            failures: scan.failures,
          }}
          locale={locale}
        />
      </div>
      <div className="lg:relative lg:z-10 lg:col-span-4 lg:col-start-9 lg:row-start-2 lg:-mt-[calc(var(--stud)*5)] lg:-ml-stud">
        <PhotoGuide guide={scan.guide} />
      </div>
    </div>
  );
}
