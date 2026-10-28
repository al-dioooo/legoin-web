import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill, plural } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import type { PartCount } from "@/lib/bricks";
import { cx } from "@/lib/cx";
import type { Idea } from "@/lib/domain";

type Copy = {
  ideas: Dictionary["ideas"];
  common: Pick<Dictionary["common"], "ideaOf" | "missingCount">;
};

const pieceCount = (parts: PartCount[]) =>
  parts.reduce((total, line) => total + line.quantity, 0);

/**
 * One build idea in the list (PRD F6): what it is, how hard it is, and how many
 * of its pieces the person has. Missing pieces are counted from `missing` only,
 * so they never pass as owned.
 */
export function IdeaCard({
  idea,
  index,
  total,
  href,
  copy,
  locale,
}: {
  idea: Idea;
  /** Position in the list, from 1. */
  index: number;
  total: number;
  href: string;
  copy: Copy;
  locale: Locale;
}) {
  const titleId = `idea-${idea.id}`;
  const used = pieceCount(idea.used);
  const missing = pieceCount(idea.missing);

  return (
    <article
      aria-labelledby={titleId}
      className="flex h-full flex-col rounded-card border-[2.5px] border-ink bg-card p-5 shadow-card"
    >
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
