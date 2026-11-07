import type { CSSProperties } from "react";
import { BrickGlyph } from "@/components/ui/brick-glyph";
import type { BrickColorId, BrickPartId } from "@/lib/bricks";

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
export function PiecesApart() {
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
