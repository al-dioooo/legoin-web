import type { Metadata } from "next";
import { CaptureFlow } from "@/components/scan/capture-flow";
import { PhotoGuide } from "@/components/scan/photo-guide";
import { currentLocale, getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.scan.title };
}

/** Photo step: capture first, the tips right below. */
export default async function ScanPage() {
  const locale = await currentLocale();
  const { scan } = await getDictionary();
  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-4xl">{scan.title}</h1>
        <p className="mt-3 max-w-xl text-lg text-ink-secondary">{scan.lead}</p>
      </header>
      <CaptureFlow
        copy={{
          capture: scan.capture,
          errors: scan.errors,
          progress: scan.progress,
          failures: scan.failures,
        }}
        locale={locale}
      />
      <PhotoGuide guide={scan.guide} />
    </div>
  );
}
