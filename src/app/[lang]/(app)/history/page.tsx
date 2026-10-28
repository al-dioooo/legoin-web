import type { Metadata } from "next";
import { getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.history.title };
}

/** Past scans. The list arrives with #20. */
export default async function HistoryPage() {
  const { history } = await getDictionary();
  return (
    <section>
      <h1 className="font-display text-4xl">{history.title}</h1>
      <p className="mt-3 max-w-xl text-lg text-ink-secondary">{history.lead}</p>
    </section>
  );
}
