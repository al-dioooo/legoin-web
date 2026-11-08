"use client";

import Image from "next/image";
import Link from "next/link";
import { type Ref, useId } from "react";
import { ConfirmDelete } from "@/components/history/confirm-delete";
import { buttonStyles } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill, formatDate, plural } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import type { Scan } from "@/lib/domain";

export type ScanRowCopy = {
  history: Pick<
    Dictionary["history"],
    "lastTheme" | "ideas" | "ideaList" | "delete"
  >;
  themes: Dictionary["ideas"]["picker"]["themes"];
  pieces: Dictionary["common"]["pieces"];
};

/**
 * One past scan on a die-cut card: its photo, when it was scanned, how many
 * pieces it found, the theme last asked for and the ideas it keeps. The whole
 * card opens the scan; each idea, the shortcut back to its ideas and the
 * delete button sit above that link.
 */
export function ScanRow({
  scan,
  locale,
  copy,
  onDelete,
  linkRef,
}: {
  scan: Scan;
  locale: Locale;
  copy: ScanRowCopy;
  /** Resolves true once the scan is gone; see `ConfirmDelete`. */
  onDelete: () => Promise<boolean>;
  /** The link that opens the scan, to move focus onto it. */
  linkRef?: Ref<HTMLAnchorElement>;
}) {
  const titleId = useId();
  const date = formatDate(scan.createdAt, locale);
  const theme = scan.lastTheme;
  const kept = scan.ideas;

  return (
    <article
      aria-labelledby={titleId}
      className="relative grid h-full grid-cols-[6rem_minmax(0,1fr)] content-start gap-x-4 gap-y-3 rounded-card border-[2.5px] border-ink bg-card p-3 shadow-card sm:grid-cols-[9rem_minmax(0,1fr)] sm:p-4"
    >
      {/* No grain: people judge brick colors on photos. The date names the
          card, so the photo is decorative here. */}
      <Image
        src={scan.photo.src}
        width={scan.photo.width}
        height={scan.photo.height}
        alt=""
        sizes="(min-width: 640px) 9rem, 6rem"
        className="aspect-[4/3] h-auto w-full rounded-callout border-2 border-ink object-cover"
      />
      <div>
        <h2 id={titleId} className="font-display text-lg leading-snug">
          {/* Stretched over the card, so the photo opens the scan too. */}
          <Link
            ref={linkRef}
            href={`/${locale}/scan/${scan.id}`}
            className="decoration-2 underline-offset-4 after:absolute after:inset-0 after:rounded-card hover:underline"
          >
            {date}
          </Link>
        </h2>
        <p className="mt-1 font-mono text-sm font-bold">
          {plural(copy.pieces, scan.detections.length, locale)}
        </p>
        {theme && (
          <p className="mt-1 text-sm text-ink-secondary">
            {fill(copy.history.lastTheme, {
              theme: copy.themes[theme].label,
            })}
          </p>
        )}
        {kept && kept.items.length > 0 && (
          <ul
            aria-label={copy.history.ideaList}
            className="mt-2 flex flex-col items-start gap-1"
          >
            {kept.items.map((idea) => (
              <li key={idea.id} className="max-w-full">
                {/* Positioned, so it stays clickable above the card's link. */}
                <Link
                  href={`/${locale}/scan/${scan.id}/ideas/${encodeURIComponent(idea.id)}?theme=${kept.theme}`}
                  className="group relative flex min-h-6 items-start gap-2 rounded-sm py-0.5 text-sm font-semibold transition-colors hover:bg-highlight"
                >
                  {/* A stud for a bullet. */}
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-2 shrink-0 rounded-full border-2 border-ink group-hover:bg-ink"
                  />
                  {/* Ideas keep the language they were written in (ADR-0004). */}
                  <span
                    lang={kept.locale}
                    className="min-w-0 break-words underline decoration-2 underline-offset-4"
                  >
                    {idea.title}
                  </span>
                  <span className="sr-only">, {date}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Positioned after the stretched link, so these stay clickable above it. */}
      <div className="relative col-span-2 flex flex-wrap items-start gap-2">
        {theme && (
          <Link
            href={`/${locale}/scan/${scan.id}/ideas?theme=${theme}`}
            className={buttonStyles({ variant: "secondary", size: "sm" })}
          >
            {copy.history.ideas}
            <span className="sr-only">, {date}</span>
            <span aria-hidden="true">→</span>
          </Link>
        )}
        <ConfirmDelete
          copy={copy.history.delete}
          context={date}
          onConfirm={onDelete}
        />
      </div>
    </article>
  );
}
