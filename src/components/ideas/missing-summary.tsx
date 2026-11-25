import { Odometer } from "@/components/motion/odometer";
import { PartCallout } from "@/components/ui/part-callout";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { plural } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import type { PartCount } from "@/lib/bricks";

type Copy = {
  summary: Dictionary["ideaDetail"]["summary"];
  partsMissing: string;
};

/** The counts that add up, and the parts still to find in a dashed box. */
export function MissingSummary({
  used,
  missing,
  parts,
  copy,
  locale,
}: {
  used: number;
  missing: number;
  parts: PartCount[];
  copy: Copy;
  locale: Locale;
}) {
  const { summary } = copy;
  const counts = [
    [summary.needed, used + missing],
    [summary.have, used],
    [summary.missing, missing],
  ] as const;
  return (
    <section
      aria-labelledby="missing-title"
      className="rounded-card border-[2.5px] border-ink bg-card p-5 shadow-card"
    >
      <h2 id="missing-title" className="font-display text-xl">
        {summary.title}
      </h2>
      <dl className="mt-4 grid grid-cols-3 gap-2">
        {counts.map(([label, count]) => (
          <div
            key={label}
            className="rounded-control border-2 border-ink bg-page px-2 py-2 sm:px-3"
          >
            <dt className="text-xs font-semibold text-ink-secondary hyphens-auto">
              {label}
            </dt>
            <dd className="font-mono text-2xl font-bold">
              <span className="sr-only">{count}</span>
              <Odometer value={count} />
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4">
        {missing === 0 ? summary.none : plural(summary.some, missing, locale)}
      </p>
      {parts.length > 0 && (
        <PartCallout
          title={copy.partsMissing}
          parts={parts}
          locale={locale}
          missing
          detailed
          className="mt-4"
        />
      )}
    </section>
  );
}
