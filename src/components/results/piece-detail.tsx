import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { BrickGlyph } from "@/components/ui/brick-glyph";
import { BrickSwatch } from "@/components/ui/brick-swatch";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/locales";
import { BRICK_PARTS, formatPercent } from "@/lib/bricks";
import { type Detection, LOW_CONFIDENCE } from "@/lib/domain";

type Copy = Dictionary["results"]["piece"];

/** The selected piece: what it is, how sure the detector was, and what to check. */
export function PieceDetail({
  detection,
  locale,
  copy,
  children,
}: {
  detection: Detection | null;
  locale: Locale;
  copy: Copy;
  /** Actions for the piece, such as editing (#16). */
  children?: ReactNode;
}) {
  return (
    <section
      aria-labelledby="piece-title"
      aria-live="polite"
      className="rounded-card border-[2.5px] border-ink bg-card p-4 shadow-card"
    >
      <h2
        id="piece-title"
        className="font-mono text-xs font-bold tracking-[0.25em] uppercase"
      >
        {copy.title}
      </h2>
      {detection ? (
        <div className="mt-3">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-20 shrink-0 place-items-center rounded-[0.625rem] bg-page">
              <BrickGlyph
                part={detection.part}
                color={detection.color}
                unit={14}
              />
            </div>
            <div className="min-w-0">
              <p className="font-display text-xl">
                {BRICK_PARTS[detection.part].label}
              </p>
              <BrickSwatch color={detection.color} locale={locale} />
              <p className="mt-1 font-mono text-xs">
                {detection.confidence === null ? (
                  copy.added
                ) : (
                  <>
                    <span className="text-ink-secondary">
                      {copy.confidence}
                    </span>{" "}
                    <span className="font-bold">
                      {formatPercent(detection.confidence, locale)}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
          {detection.confidence !== null &&
            detection.confidence < LOW_CONFIDENCE && (
              <div className="mt-3 flex flex-col items-start gap-1.5">
                <Badge tone="warning">{copy.check}</Badge>
                <p className="text-sm">{copy.lowConfidence}</p>
              </div>
            )}
          {children}
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink-secondary">{copy.empty}</p>
      )}
    </section>
  );
}
