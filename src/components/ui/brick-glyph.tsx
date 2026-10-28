import {
  BRICK_COLORS,
  BRICK_PARTS,
  type BrickColorId,
  type BrickPartId,
  brickColorVar,
} from "@/lib/bricks";

type BrickGlyphProps = {
  part: BrickPartId;
  color: BrickColorId;
  /** Size of one stud cell in px. */
  unit?: number;
  className?: string;
};

/** A part drawn from above, as in an instruction booklet. Decorative: label it nearby. */
export function BrickGlyph({
  part,
  color,
  unit = 14,
  className,
}: BrickGlyphProps) {
  const {
    kind,
    studs: [rows, columns],
  } = BRICK_PARTS[part];
  const width = columns * unit;
  const height = rows * unit;
  const fill = brickColorVar(color);
  const studStroke =
    BRICK_COLORS[color].tone === "dark"
      ? "var(--stud-on-dark)"
      : "var(--stud-on-light)";
  const outline = "var(--border-strong)";
  // Slopes keep studs only on the back row; tiles have none.
  const studRows = kind === "tile" ? 0 : kind === "slope" ? 1 : rows;

  const studs = [];
  for (let row = 0; row < studRows; row++) {
    for (let column = 0; column < columns; column++) {
      studs.push(
        <circle
          key={`${row}-${column}`}
          cx={(column + 0.5) * unit}
          cy={(row + 0.5) * unit}
          r={unit * 0.3}
          fill={fill}
          stroke={studStroke}
          strokeWidth={1.25}
        />,
      );
    }
  }

  return (
    <svg
      aria-hidden="true"
      width={width + 2}
      height={height + 2}
      viewBox={`-1 -1 ${width + 2} ${height + 2}`}
      className={className}
    >
      {kind === "round" ? (
        <circle
          cx={width / 2}
          cy={height / 2}
          r={unit / 2}
          fill={fill}
          stroke={outline}
        />
      ) : (
        <rect
          width={width}
          height={height}
          rx={unit * 0.15}
          fill={fill}
          stroke={outline}
        />
      )}
      {kind === "slope" && (
        <rect
          y={unit}
          width={width}
          height={height - unit}
          fill="var(--stud-on-dark)"
          stroke={studStroke}
          strokeWidth={1}
        />
      )}
      {studs}
    </svg>
  );
}
