import type { Metadata } from "next";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.scan.title };
}

/** Photo step. The guide and capture arrive with #13. */
export default async function ScanPage() {
  const { scan } = await getDictionary();
  return (
    <section>
      <h1 className="font-display text-4xl">{scan.title}</h1>
      <p className="mt-3 max-w-xl text-lg text-ink-secondary">{scan.lead}</p>
    </section>
  );
}
