import Link from "next/link";
import {
  BuildPreview,
  BuildPreviewPending,
} from "@/components/ideas/build-preview";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill, plural } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import type { PartCount } from "@/lib/bricks";
import { cx } from "@/lib/cx";
import type { Idea, IdeaTheme } from "@/lib/domain";

type Copy = {
  ideas: Dictionary["ideas"];
  common: Pick<Dictionary["common"], "ideaOf" | "missingCount">;
};

const pieceCount = (parts: PartCount[]) =>
  parts.reduce((total, line) => total + line.quantity, 0);

/**
 * One build idea in the list (PRD F6): what it is, how hard it is, and how many
 * of its pieces the person has. Missing pieces are counted from `missing` only,
 * so they never pass as owned. A checked build shows its picture on top.
 */
export function IdeaCard({
  idea,
  index,
  total,
  href,
  copy,
  locale,
  arrived = false,
}: {
  idea: Idea;
  /** Position in the list, from 1. */
  index: number;
  total: number;
  href: string;
  copy: Copy;
  locale: Locale;
  /** It was being built a moment ago, so it clicks in (ADR-0006). */
  arrived?: boolean;
}) {
  const titleId = `idea-${idea.id}`;
  const used = pieceCount(idea.used);
  const missing = pieceCount(idea.missing);

  return (
    <article
      aria-labelledby={titleId}
      className={cx(
        "flex h-full flex-col rounded-card border-[2.5px] border-ink bg-card p-5 shadow-card",
        arrived && "click-in",
      )}
    >
      {idea.preview && (
        <BuildPreview
          preview={idea.preview}
          alt={fill(copy.ideas.preview.alt, { title: idea.title })}
          size="card"
          className="mb-4"
        />
      )}
      <p className="font-mono text-xs font-bold tracking-[0.2em] uppercase">
        {fill(copy.common.ideaOf, { index, total })} ·{" "}
        {copy.ideas.picker.themes[idea.theme].label}
      </p>
      <h2 id={titleId} className="mt-2 font-display text-2xl">
        {idea.title}
      </h2>
      <p className="mt-2">{idea.summary}</p>
      <ul className="mt-4 mb-5 flex flex-wrap gap-2">
        <li>
          <Badge tone="highlight">
            {copy.ideas.difficulty[idea.difficulty]}
          </Badge>
        </li>
        {missing === 0 ? (
          <li>
            <Badge tone="success">{copy.ideas.complete}</Badge>
          </li>
        ) : (
          <>
            <li>
              <Badge>
                {used === 0
                  ? copy.ideas.usesNone
                  : plural(copy.ideas.uses, used, locale)}
              </Badge>
            </li>
            <li>
              <Badge tone="warning">
                {plural(copy.common.missingCount, missing, locale)}
              </Badge>
            </li>
          </>
        )}
      </ul>
      <Link
        href={href}
        className={cx(
          buttonStyles({ variant: "secondary", size: "sm" }),
          "mt-auto self-start",
        )}
      >
        {copy.ideas.seeSteps}
        <span className="sr-only">: {idea.title}</span>
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

/**
 * An idea still being built from the scan (ADR-0013), holding its card's
 * place: its number and theme, and the build preview's placeholder. It isn't a
 * link: there's nothing to open until it's done.
 */
export function BuildingCard({
  theme,
  index,
  total,
  copy,
}: {
  theme: IdeaTheme;
  index: number;
  total: number;
  copy: Pick<Copy, "common"> & {
    ideas: Pick<Copy["ideas"], "building" | "picker">;
  };
}) {
  return (
    <div className="flex h-full flex-col rounded-card border-[2.5px] border-dashed border-ink bg-card p-5">
      <BuildPreviewPending
        label={copy.ideas.building.card}
        size="card"
        className="mb-4"
      />
      <p className="font-mono text-xs font-bold tracking-[0.2em] uppercase">
        {fill(copy.common.ideaOf, { index, total })} ·{" "}
        {copy.ideas.picker.themes[theme].label}
      </p>
    </div>
  );
}
