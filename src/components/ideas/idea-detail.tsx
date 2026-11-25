"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BuildPreview,
  BuildPreviewPending,
} from "@/components/ideas/build-preview";
import { BuildSteps } from "@/components/ideas/build-steps";
import { MissingSummary } from "@/components/ideas/missing-summary";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { EmptyState, EmptyStateIcon } from "@/components/ui/empty-state";
import { PartCallout } from "@/components/ui/part-callout";
import { Sticker } from "@/components/ui/sticker";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill, plural } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { getIdea, getScan, PREVIEW_POLL_MS } from "@/lib/api";
import type { PartCount } from "@/lib/bricks";
import { cx } from "@/lib/cx";
import {
  type Idea,
  isTheme,
  previewComing,
  type StoredIdea,
  type Theme,
} from "@/lib/domain";

type Copy = {
  ideaDetail: Dictionary["ideaDetail"];
  ideas: Pick<
    Dictionary["ideas"],
    "difficulty" | "complete" | "usesNone" | "preview"
  >;
  themes: Dictionary["ideas"]["picker"]["themes"];
  results: Pick<Dictionary["results"], "missing">;
  common: Pick<
    Dictionary["common"],
    "ideaOf" | "missingCount" | "partsUsed" | "partsMissing" | "step"
  >;
};

type View =
  | { kind: "ready"; stored: StoredIdea }
  | { kind: "missingIdea" }
  | { kind: "missingScan" }
  | { kind: "failed" };

const pieceCount = (parts: PartCount[]) =>
  parts.reduce((total, line) => total + line.quantity, 0);

export function IdeaDetailLoading({ label }: { label: string }) {
  return (
    <div className="max-w-2xl space-y-4" aria-busy="true">
      <p className="text-ink-secondary">{label}</p>
      <div className="h-14 w-3/4 animate-pulse rounded-callout border-2 border-line bg-callout motion-reduce:animate-none" />
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-20 animate-pulse rounded-callout border-2 border-line bg-callout motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

/**
 * One build idea in full (PRD F6), from the scan's latest set: the parts it
 * uses, what's missing, and numbered steps that can be ticked off. Previous and
 * next walk the set; links keep `?theme` and the demo options.
 *
 * The idea is shown in the language it was written in. Real ideas are
 * generated once, in one language (ADR-0004), so on the other language's page
 * a note says so and offers new ideas instead of translating these.
 */
export function IdeaDetail({ copy, locale }: { copy: Copy; locale: Locale }) {
  const { id, ideaId } = useParams<{ id: string; ideaId: string }>();
  const searchParams = useSearchParams();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ key: string; view: View } | null>(
    null,
  );
  const failedHeading = useRef<HTMLHeadingElement>(null);
  // Previous and next may reuse this screen, so a result counts only for the
  // idea it was loaded for.
  const key = `${id}/${ideaId}/${attempt}`;

  useEffect(() => {
    let active = true;
    const loaded = `${id}/${ideaId}/${attempt}`;
    async function load(): Promise<View> {
      try {
        const stored = await getIdea(id, ideaId);
        if (stored) return { kind: "ready", stored };
        // Only when there's no idea: tell a replaced idea from a deleted scan.
        return (await getScan(id))
          ? { kind: "missingIdea" }
          : { kind: "missingScan" };
      } catch {
        return { kind: "failed" };
      }
    }
    void load().then((view) => {
      if (active) setResult({ key: loaded, view });
    });
    return () => {
      active = false;
    };
  }, [id, ideaId, attempt]);

  /** This page's query with `theme` set (or dropped), keeping the demo options. */
  function queryWith(theme: Theme | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (theme) params.set("theme", theme);
    else params.delete("theme");
    const query = params.toString();
    return query ? `?${query}` : "";
  }

  /** The ideas list for `theme`, or the theme picker without one. */
  const listHref = (theme: Theme | null) =>
    `/${locale}/scan/${id}/ideas${queryWith(theme)}`;

  const view = result?.key === key ? result.view : null;
  const failed = view?.kind === "failed";
  const waiting =
    view?.kind === "ready" && previewComing(view.stored.idea)
      ? view.stored.idea.id
      : null;

  // A preview on its way (opening an `on_open` idea starts it): read the idea
  // again every few seconds, without the loading view, until it's settled.
  // When it's ready, its steps and parts are the build's.
  // biome-ignore lint/correctness/useExhaustiveDependencies: result changes with each read, which schedules the next
  useEffect(() => {
    if (!waiting) return;
    let active = true;
    const timer = setTimeout(() => {
      void getIdea(id, ideaId).then(
        (stored) => {
          if (active && stored) {
            setResult({ key, view: { kind: "ready", stored } });
          }
        },
        () => {
          if (active) setResult((current) => current && { ...current });
        },
      );
    }, PREVIEW_POLL_MS);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [waiting, result]);

  // The error replaces the loading view, so focus its heading for it to be heard.
  useEffect(() => {
    if (failed) failedHeading.current?.focus();
  }, [failed]);

  if (!view) {
    return <IdeaDetailLoading label={copy.ideaDetail.loading} />;
  }

  if (view.kind === "missingScan") {
    return (
      <EmptyState
        as="h1"
        icon={<EmptyStateIcon />}
        title={copy.results.missing.title}
        body={copy.results.missing.body}
        actions={
          <Link href={`/${locale}/scan`} className={buttonStyles()}>
            {copy.results.missing.action}
          </Link>
        }
      />
    );
  }

  if (view.kind === "missingIdea") {
    const requested = searchParams.get("theme");
    return (
      <EmptyState
        as="h1"
        icon={<EmptyStateIcon />}
        title={copy.ideaDetail.missing.title}
        body={copy.ideaDetail.missing.body}
        actions={
          <Link
            href={listHref(isTheme(requested) ? requested : null)}
            className={buttonStyles()}
          >
            {copy.ideaDetail.missing.action}
          </Link>
        }
      />
    );
  }

  if (view.kind === "failed") {
    return (
      <EmptyState
        as="h1"
        tone="danger"
        headingRef={failedHeading}
        icon={<EmptyStateIcon variant="error" />}
        title={copy.ideaDetail.failed.title}
        body={copy.ideaDetail.failed.body}
        actions={
          <Button onClick={() => setAttempt((count) => count + 1)}>
            {copy.ideaDetail.failed.retry}
          </Button>
        }
      />
    );
  }

  const { idea, set } = view.stored;
  const index = set.items.findIndex((item) => item.id === idea.id);
  const previous = set.items[index - 1];
  const next = set.items[index + 1];
  // The set's own theme, so links stay right after a language switch drops
  // the query.
  const ideaHref = (other: Idea) =>
    `/${locale}/scan/${id}/ideas/${encodeURIComponent(other.id)}${queryWith(set.theme)}`;
  const used = pieceCount(idea.used);
  const missing = pieceCount(idea.missing);
  // The idea's own words keep their language; everything around them is UI copy.
  const written = set.locale;

  return (
    <article
      aria-labelledby="idea-title"
      // The flexible middle row takes the parts column's extra height, so the
      // steps sit right under the title.
      className="grid gap-y-[calc(var(--stud)*1.5)] lg:grid-cols-12 lg:grid-rows-[auto_1fr_auto] lg:gap-x-stud"
    >
      <header className="click-in lg:col-span-7 lg:row-start-1">
        <Link
          href={listHref(set.theme)}
          className={cx(
            buttonStyles({ variant: "ghost", size: "sm" }),
            "-ml-4",
          )}
        >
          <span aria-hidden="true">←</span> {copy.ideaDetail.back}
        </Link>
        <p className="mt-3 font-mono text-xs font-bold tracking-[0.2em] uppercase">
          {fill(copy.common.ideaOf, {
            index: index + 1,
            total: set.items.length,
          })}{" "}
          · {copy.themes[idea.theme].label}
        </p>
        <h1
          id="idea-title"
          lang={written}
          className="mt-3 pr-[4.5rem] font-display text-3xl leading-tight sm:pr-0 sm:text-5xl"
        >
          <Sticker className="-rotate-2">{idea.title}</Sticker>
        </h1>
        <ul className="mt-4 flex flex-wrap gap-2">
          <li>
            <Badge tone="highlight">
              {copy.ideas.difficulty[idea.difficulty]}
            </Badge>
          </li>
          <li>
            {missing === 0 ? (
              <Badge tone="success">{copy.ideas.complete}</Badge>
            ) : (
              <Badge tone="warning">
                {plural(copy.common.missingCount, missing, locale)}
              </Badge>
            )}
          </li>
        </ul>
        <p lang={written} className="mt-3 max-w-prose text-lg">
          {idea.summary}
        </p>
        {written !== locale && (
          <div className="mt-stud flex max-w-prose flex-wrap items-center gap-3 rounded-callout border-2 border-ink bg-highlight-subtle p-4">
            <p className="flex-1 basis-60">
              {fill(copy.ideaDetail.language.note, {
                language: copy.ideaDetail.language.names[written],
              })}
            </p>
            <Link
              href={listHref(set.theme)}
              className={buttonStyles({ variant: "secondary", size: "sm" })}
            >
              {copy.ideaDetail.language.action}
            </Link>
          </div>
        )}
      </header>

      {/* Parts first on phones, so you gather them before building; down the
          right on desktop, dropped a few studs like a booklet's parts callout.
          It stays clear of the steps, so it never covers their checkboxes. */}
      <aside className="assemble space-y-stud lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:pt-[calc(var(--stud)*4)]">
        {/* A checked build shows what it makes before what it takes, like a
            booklet's cover, with its LDraw model to open in a 3D app. */}
        {!idea.preview && previewComing(idea) && (
          <BuildPreviewPending label={copy.ideas.preview.pending} size="page" />
        )}
        {idea.preview && (
          <div>
            <BuildPreview
              key={idea.buildId}
              preview={idea.preview}
              alt={fill(copy.ideas.preview.alt, { title: idea.title })}
              size="page"
              className={cx(idea.previewStatus === "ready" && "click-in")}
            />
            <a
              href={idea.preview.model}
              download={`${idea.buildId ?? idea.id}.ldr`}
              className={cx(
                buttonStyles({ variant: "secondary", size: "sm" }),
                "mt-3",
              )}
            >
              {copy.ideas.preview.model}
            </a>
          </div>
        )}
        {idea.used.length > 0 ? (
          <PartCallout
            title={copy.common.partsUsed}
            parts={idea.used}
            locale={locale}
            detailed
          />
        ) : (
          <section
            aria-label={copy.common.partsUsed}
            className="rounded-callout border-2 border-ink bg-card p-4"
          >
            <p className="mb-2 font-mono text-xs font-bold tracking-[0.2em] uppercase">
              {copy.common.partsUsed}
            </p>
            <p className="text-ink-secondary">{copy.ideas.usesNone}</p>
          </section>
        )}
        <MissingSummary
          used={used}
          missing={missing}
          parts={idea.missing}
          copy={{
            summary: copy.ideaDetail.summary,
            partsMissing: copy.common.partsMissing,
          }}
          locale={locale}
        />
      </aside>

      <section
        aria-labelledby="steps-title"
        className="lg:col-span-7 lg:row-start-2"
      >
        <h2 id="steps-title" className="click-in font-display text-xl">
          <Sticker tone="paper" className="rotate-2">
            {copy.ideaDetail.steps}
          </Sticker>
        </h2>
        {/* Keyed by idea, so ticks never carry over to the next idea. */}
        {idea.previewStatus === "ready" && (
          <p className="mt-stud max-w-prose text-sm text-ink-secondary">
            {copy.ideas.preview.updated}
          </p>
        )}
        <BuildSteps
          key={`${idea.id}:${idea.buildId ?? ""}`}
          steps={idea.steps}
          lang={written}
          copy={{
            markDone: copy.ideaDetail.markDone,
            progress: copy.ideaDetail.progress,
            allDone: copy.ideaDetail.allDone,
            step: copy.common.step,
          }}
          className="mt-stud"
        />
      </section>

      <nav
        aria-label={copy.ideaDetail.nav}
        className="grid gap-3 sm:grid-cols-2 lg:col-span-7 lg:row-start-3"
      >
        {previous && (
          <IdeaLink
            href={ideaHref(previous)}
            label={copy.ideaDetail.previous}
            title={previous.title}
            lang={written}
            direction="previous"
          />
        )}
        {next && (
          <IdeaLink
            href={ideaHref(next)}
            label={copy.ideaDetail.next}
            title={next.title}
            lang={written}
            direction="next"
            className="sm:col-start-2"
          />
        )}
      </nav>
    </article>
  );
}

function IdeaLink({
  href,
  label,
  title,
  lang,
  direction,
  className,
}: {
  href: string;
  label: string;
  title: string;
  lang: Locale;
  direction: "previous" | "next";
  className?: string;
}) {
  return (
    <Link
      href={href}
      rel={direction === "previous" ? "prev" : "next"}
      className={cx(
        "press flex flex-col gap-1 rounded-callout border-[2.5px] border-ink bg-card px-4 py-3 shadow-button [--press:4px] hover:bg-highlight active:shadow-none",
        direction === "next" && "items-end text-right",
        className,
      )}
    >
      <span className="font-mono text-xs font-bold tracking-[0.2em] uppercase">
        {direction === "previous" && <span aria-hidden="true">← </span>}
        {label}
        {direction === "next" && <span aria-hidden="true"> →</span>}
        <span className="sr-only">: </span>
      </span>
      <span lang={lang} className="font-display text-lg">
        {title}
      </span>
    </Link>
  );
}
