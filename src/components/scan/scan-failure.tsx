"use client";

import { type CSSProperties, useEffect, useRef } from "react";
import { BrickGlyph } from "@/components/ui/brick-glyph";
import { Button, buttonStyles } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { BrickColorId, BrickPartId } from "@/lib/bricks";
import type { ScanFailure } from "@/lib/domain";

type Copy = Dictionary["scan"]["failures"];

const UNIT = 12;

/** A small build seen from above: where each piece sits, and where it lands. */
const PIECES: {
  part: BrickPartId;
  color: BrickColorId;
  at: [number, number];
  landing: [number, number, number];
}[] = [
  { part: "brick-2x4", color: "red", at: [0, 0], landing: [-30, 30, -22] },
  { part: "brick-2x2", color: "yellow", at: [4, 0], landing: [34, -10, 28] },
  { part: "brick-2x2", color: "green", at: [0, 2], landing: [-14, 46, 16] },
  { part: "plate-1x2", color: "blue", at: [2, 2], landing: [6, 40, -38] },
  { part: "brick-1x2", color: "white", at: [2, 3], landing: [26, 50, 12] },
  { part: "brick-2x2", color: "black", at: [4, 2], landing: [40, 26, -12] },
];

/** The build falling apart: the scan didn't come together. Decorative. */
function PiecesApart() {
  return (
    <div aria-hidden="true" className="relative h-28 w-36 shrink-0">
      <div className="absolute top-3 left-8">
        {PIECES.map((piece, index) => (
          <BrickGlyph
            key={`${piece.part}-${piece.color}`}
            part={piece.part}
            color={piece.color}
            unit={UNIT}
            className="tumble-piece"
            style={
              {
                left: piece.at[0] * UNIT,
                top: piece.at[1] * UNIT,
                "--i": index,
                "--tx": `${piece.landing[0]}px`,
                "--ty": `${piece.landing[1]}px`,
                "--rot": `${piece.landing[2]}deg`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}

/** What went wrong with a scan, and the way forward for that reason. */
export function ScanFailureView({
  reason,
  copy,
  onRetake,
  onRetry,
}: {
  reason: ScanFailure;
  copy: Copy;
  onRetake: () => void;
  onRetry: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  // Move focus here so screen readers announce what happened.
  useEffect(() => {
    heading.current?.focus();
  }, []);

  const message = copy[reason];
  // A dropped connection keeps the photo; the other reasons need a new one.
  const canRetry = reason === "network";

  return (
    <section
      aria-labelledby="failure-title"
      className="click-in flex flex-col-reverse gap-stud rounded-card border-[2.5px] border-ink bg-danger-subtle p-5 shadow-card sm:flex-row sm:items-start sm:justify-between sm:p-6"
    >
      <div>
        <h2
          ref={heading}
          id="failure-title"
          tabIndex={-1}
          className="font-display text-2xl outline-none"
        >
          {message.title}
        </h2>
        <p className="mt-2 max-w-xl">{message.body}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {canRetry ? (
            <>
              <Button onClick={onRetry}>{copy.retry}</Button>
              <Button variant="secondary" onClick={onRetake}>
                {copy.retake}
              </Button>
            </>
          ) : (
            <Button onClick={onRetake}>{copy.retake}</Button>
          )}
          <a href="#photo-tips" className={buttonStyles({ variant: "ghost" })}>
            {copy.tips}
          </a>
        </div>
      </div>
      <PiecesApart />
    </section>
  );
}
