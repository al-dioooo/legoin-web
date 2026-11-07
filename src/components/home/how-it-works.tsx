import { Card } from "@/components/ui/card";
import { StepNumber } from "@/components/ui/step-number";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { cx } from "@/lib/cx";

type Copy = {
  how: Dictionary["home"]["how"];
  /** The step names from the app header, so home and the flow match. */
  steps: Pick<Dictionary["app"]["steps"], "photo" | "pieces" | "ideas">;
  step: string;
};

/** The flow in three steps on home: photo, pieces, ideas. */
export function HowItWorks({
  copy,
  className,
}: {
  copy: Copy;
  className?: string;
}) {
  const steps = [
    { key: "photo", title: copy.steps.photo, body: copy.how.photo },
    { key: "pieces", title: copy.steps.pieces, body: copy.how.pieces },
    { key: "ideas", title: copy.steps.ideas, body: copy.how.ideas },
  ];
  return (
    <section aria-labelledby="how-title" className={className}>
      <h2 id="how-title" className="font-display text-3xl">
        {copy.how.title}
      </h2>
      <ol className="mt-8 grid gap-12 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.key} className="relative">
            <Card className="h-full">
              <StepNumber value={index + 1} label={copy.step} />
              <h3 className="mt-4 font-display text-xl">{step.title}</h3>
              <p className="mt-2 text-ink-secondary">{step.body}</p>
            </Card>
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cx(
                  "absolute font-display text-2xl leading-none",
                  "-bottom-10 left-1/2 -translate-x-1/2 rotate-90",
                  "md:top-1/2 md:bottom-auto md:-right-10 md:left-auto md:translate-x-0 md:-translate-y-1/2 md:rotate-0",
                )}
              >
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
