import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { BrickGlyph } from "@/components/ui/brick-glyph";
import type { Dictionary } from "@/i18n/dictionaries/en";

type Guide = Dictionary["scan"]["guide"];

/** Viewfinder corners around a piece, like the logo: "from above". */
function Viewfinder({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-grid place-items-center p-3">
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        fill="none"
        className="absolute inset-0 size-full"
      >
        <path
          d="M3 10V5a2 2 0 0 1 2-2h5M22 3h5a2 2 0 0 1 2 2v5M29 22v5a2 2 0 0 1-2 2h-5M10 29H5a2 2 0 0 1-2-2v-5"
          stroke="var(--text-primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {children}
    </span>
  );
}

function Sun() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-8"
      fill="var(--highlight)"
      stroke="var(--text-primary)"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
    </svg>
  );
}

function Tip({
  illustration,
  badge,
  title,
  body,
}: {
  illustration: ReactNode;
  badge: ReactNode;
  title: string;
  body: string;
}) {
  return (
    // Side by side on phones so four tips don't take four screens; stacked from sm up.
    <li className="flex gap-4 rounded-callout border-2 border-ink bg-card p-4 sm:flex-col sm:gap-3">
      <div className="flex h-20 w-28 shrink-0 items-center justify-center gap-2 rounded-[0.625rem] bg-page sm:w-auto sm:gap-3">
        {illustration}
      </div>
      <div className="flex flex-col items-start gap-2">
        {badge}
        <h3 className="font-display text-lg leading-tight">{title}</h3>
        <p className="text-sm text-ink-secondary">{body}</p>
      </div>
    </li>
  );
}

/** Do / don't cards for taking a photo the pipeline can read (PRD F1). */
export function PhotoGuide({ guide }: { guide: Guide }) {
  const yes = (
    <Badge tone="success" className="self-start">
      {guide.do}
    </Badge>
  );
  return (
    <section aria-labelledby="photo-tips">
      <h2 id="photo-tips" className="font-display text-2xl">
        {guide.title}
      </h2>
      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tip
          illustration={
            <>
              <BrickGlyph part="brick-2x4" color="red" unit={10} />
              <BrickGlyph part="brick-2x2" color="yellow" unit={10} />
              <BrickGlyph part="plate-1x2" color="blue" unit={10} />
            </>
          }
          badge={yes}
          title={guide.plain.title}
          body={guide.plain.body}
        />
        <Tip
          illustration={
            <Viewfinder>
              <BrickGlyph part="brick-2x2" color="green" unit={12} />
            </Viewfinder>
          }
          badge={yes}
          title={guide.above.title}
          body={guide.above.body}
        />
        <Tip
          illustration={
            <>
              <Sun />
              <BrickGlyph part="brick-1x4" color="white" unit={10} />
            </>
          }
          badge={yes}
          title={guide.light.title}
          body={guide.light.body}
        />
        <Tip
          illustration={
            <span className="relative block h-12 w-20">
              <BrickGlyph
                part="brick-2x4"
                color="red"
                unit={10}
                className="absolute top-0 left-0"
              />
              <BrickGlyph
                part="brick-2x2"
                color="yellow"
                unit={10}
                className="absolute top-3 left-6"
              />
              <BrickGlyph
                part="plate-1x2"
                color="blue"
                unit={10}
                className="absolute top-7 left-2"
              />
            </span>
          }
          badge={
            <Badge tone="danger" className="self-start">
              {guide.dont}
            </Badge>
          }
          title={guide.apart.title}
          body={guide.apart.body}
        />
      </ul>
    </section>
  );
}
