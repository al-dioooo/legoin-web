import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PartCallout } from "@/components/ui/part-callout";
import { StepNumber } from "@/components/ui/step-number";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill, plural } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { cx } from "@/lib/cx";
import { SAMPLE_IDEA, SAMPLE_MISSING_COUNT } from "@/lib/sample-scan";

type Copy = {
  sample: Dictionary["sample"];
  common: Pick<
    Dictionary["common"],
    "ideaOf" | "missingCount" | "partsUsed" | "partsMissing" | "step"
  >;
};

/**
 * The sample scan's build idea. "See the steps" opens its parts and steps in
 * place, as a native disclosure that needs no script. Real ideas get their own
 * detail page (#19).
 */
export function SampleIdea({
  copy,
  locale,
  className,
}: {
  copy: Copy;
  locale: Locale;
  className?: string;
}) {
  const { sample, common } = copy;
  return (
    <Card className={cx("p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-xs font-bold">
          {fill(common.ideaOf, { index: 1, total: 3 })}
        </span>
        <span className="flex gap-1.5">
          <Badge tone="highlight">{sample.idea.difficulty}</Badge>
          <Badge tone="warning">
            {plural(common.missingCount, SAMPLE_MISSING_COUNT, locale)}
          </Badge>
        </span>
      </div>
      <h3 className="mt-2 font-display text-2xl">{sample.idea.title}</h3>
      <p className="mt-1 text-sm text-ink-secondary">{sample.idea.summary}</p>
      <details className="group mt-4">
        {/* Secondary: the page's one red button is "Start scanning". */}
        <summary
          className={cx(
            buttonStyles({ variant: "secondary", size: "sm" }),
            "cursor-pointer list-none [&::-webkit-details-marker]:hidden",
          )}
        >
          <span className="group-open:hidden">{sample.seeSteps}</span>
          <span className="hidden group-open:inline">{sample.hideSteps}</span>
          <span
            aria-hidden="true"
            className="transition-transform duration-300 ease-spring group-open:rotate-180"
          >
            ↓
          </span>
        </summary>
        <div className="mt-4 space-y-4">
          <PartCallout
            title={common.partsUsed}
            parts={SAMPLE_IDEA.used}
            locale={locale}
          />
          <PartCallout
            title={common.partsMissing}
            parts={SAMPLE_IDEA.missing}
            locale={locale}
            missing
          />
          <ol className="space-y-3">
            {sample.idea.steps.map((step, index) => (
              <li key={step} className="flex items-center gap-3 text-sm">
                <StepNumber value={index + 1} label={common.step} />
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </details>
    </Card>
  );
}
