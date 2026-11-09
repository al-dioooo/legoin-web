"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { IdeaCard } from "@/components/ideas/idea-card";
import { ThemePicker } from "@/components/ideas/theme-picker";
import { Button, buttonStyles } from "@/components/ui/button";
import { EmptyState, EmptyStateIcon } from "@/components/ui/empty-state";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { plural } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { getIdeas, getScan } from "@/lib/api";
import { type Idea, isTheme, type Scan, type Theme } from "@/lib/domain";

type Copy = {
  ideas: Dictionary["ideas"];
  results: Pick<Dictionary["results"], "loading" | "missing" | "failed">;
  common: Pick<Dictionary["common"], "ideaOf" | "missingCount">;
};

type ScanState =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "failed" }
  | { kind: "ready"; scan: Scan };

/** Another ask for the same theme: other ideas or a retry. */
type Ask = { theme: Theme; exclude: string[]; attempt: number };

/**
 * How the last ask went, with the key it was asked under. The ideas themselves
 * are read from the scan's kept set, which every answer replaces.
 */
type Answer = { key: string; failed: boolean };

const NONE: string[] = [];

export function IdeasLoading({ label }: { label: string }) {
  return (
    <div className="max-w-2xl space-y-4" aria-busy="true">
      <p className="text-ink-secondary">{label}</p>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-card border-2 border-line bg-callout motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Ideas step (PRD F6–F7). Without `?theme=` it asks for a theme, preselecting
 * the one used last; with it, it shows ideas for that theme and lets people
 * switch theme in place.
 *
 * Ideas the scan already keeps for this theme, in this language, are shown
 * without asking again, so coming back costs no wait and keeps the same ideas.
 * Other ideas, a retry and a theme the kept set isn't for always ask.
 */
export function IdeasScreen({ copy, locale }: { copy: Copy; locale: Locale }) {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const requested = searchParams.get("theme");
  const theme = isTheme(requested) ? requested : null;
  // Demo options such as `?mockDelay=0` ride along in the same query.
  const query = searchParams.toString();
  const [scanState, setScanState] = useState<ScanState>({ kind: "loading" });
  /** Counts retries of a failed scan load, so each one loads it again. */
  const [scanAttempt, setScanAttempt] = useState(0);
  const [choice, setChoice] = useState<Theme | null>(null);
  const [ask, setAsk] = useState<Ask | null>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);
  // An ask on its way, so showing the page again waits for it instead of
  // sending it twice.
  const pending = useRef<{ key: string; ideas: Promise<Idea[]> } | null>(null);
  const failedHeading = useRef<HTMLHeadingElement>(null);
  // A new theme starts over; asks for an earlier theme no longer apply.
  const current = ask && ask.theme === theme ? ask : null;
  const exclude = current?.exclude ?? NONE;
  const attempt = current?.attempt ?? 0;
  const key = `${theme}:${attempt}`;

  const scan = scanState.kind === "ready" ? scanState.scan : null;
  // Ideas aren't translated (ADR-0004), so a set in the other language doesn't
  // count; neither does one a correction dropped.
  const kept =
    scan?.ideas?.theme === theme && scan.ideas.locale === locale
      ? scan.ideas.items
      : null;
  const answered = answer?.key === key ? answer : null;
  const failed = answered?.failed === true;
  // Other ideas and retries wait for their own answer.
  const ideas = !failed && (attempt === 0 || answered) ? kept : null;
  const shouldAsk =
    theme !== null &&
    scan !== null &&
    scan.detections.length > 0 &&
    !failed &&
    ideas === null;

  // biome-ignore lint/correctness/useExhaustiveDependencies: a retry bumps scanAttempt to load the scan again
  useEffect(() => {
    let active = true;
    // Runs again when Next shows this page again, so a dropped or replaced
    // set doesn't linger.
    void getScan(id).then(
      (found) => {
        if (active)
          setScanState(
            found ? { kind: "ready", scan: found } : { kind: "missing" },
          );
      },
      () => {
        if (active) setScanState({ kind: "failed" });
      },
    );
    return () => {
      active = false;
    };
  }, [id, scanAttempt]);

  // The error replaces the loading view, so focus its heading for it to be heard.
  useEffect(() => {
    if (scanState.kind === "failed") failedHeading.current?.focus();
  }, [scanState.kind]);

  useEffect(() => {
    if (!shouldAsk || !theme) return;
    let active = true;
    const asked = `${theme}:${attempt}`;
    const answering =
      pending.current?.key === asked
        ? pending.current.ideas
        : getIdeas(id, theme, locale, { exclude });
    pending.current = { key: asked, ideas: answering };
    answering
      .then(
        (items) => {
          // The scan keeps these now, even if the page moved on, so it never
          // shows a set the scan no longer has.
          setScanState((state) =>
            state.kind === "ready"
              ? {
                  kind: "ready",
                  scan: {
                    ...state.scan,
                    lastTheme: theme,
                    ideas: { theme, locale, items },
                  },
                }
              : state,
          );
          if (active) setAnswer({ key: asked, failed: false });
        },
        () => {
          if (active) setAnswer({ key: asked, failed: true });
        },
      )
      .finally(() => {
        if (pending.current?.ideas === answering) pending.current = null;
      });
    return () => {
      active = false;
    };
  }, [id, theme, locale, exclude, attempt, shouldAsk]);

  /** The same page with another theme, keeping the demo options. */
  function themeHref(next: Theme) {
    const params = new URLSearchParams(query);
    params.set("theme", next);
    return `/${locale}/scan/${id}/ideas?${params}`;
  }

  // Remember the switch too, so going back to the picker preselects it.
  function switchTheme(next: Theme) {
    setChoice(next);
    router.replace(themeHref(next), { scroll: false });
  }

  if (scanState.kind === "loading") {
    return <IdeasLoading label={copy.results.loading} />;
  }

  if (scanState.kind === "failed") {
    return (
      <EmptyState
        as="h1"
        tone="danger"
        headingRef={failedHeading}
        icon={<EmptyStateIcon variant="error" />}
        title={copy.results.failed.title}
        body={copy.results.failed.body}
        actions={
          <Button
            onClick={() => {
              setScanState({ kind: "loading" });
              setScanAttempt((count) => count + 1);
            }}
          >
            {copy.results.failed.retry}
          </Button>
        }
      />
    );
  }

  if (scanState.kind === "missing") {
    return (
      <section className="max-w-xl rounded-card border-[2.5px] border-ink bg-card p-6 shadow-card">
        <h1 className="font-display text-3xl">{copy.results.missing.title}</h1>
        <p className="mt-2 text-ink-secondary">{copy.results.missing.body}</p>
        <Link href={`/${locale}/scan`} className={`${buttonStyles()} mt-5`}>
          {copy.results.missing.action}
        </Link>
      </section>
    );
  }

  if (scanState.scan.detections.length === 0) {
    return (
      <EmptyState
        as="h1"
        icon={<EmptyStateIcon />}
        title={copy.ideas.empty.title}
        body={copy.ideas.empty.body}
        actions={
          <Link href={`/${locale}/scan/${id}`} className={buttonStyles()}>
            {copy.ideas.empty.action}
          </Link>
        }
      />
    );
  }

  if (!theme) {
    const selected = choice ?? scanState.scan.lastTheme ?? "surprise";
    const submit = (event: FormEvent) => {
      event.preventDefault();
      router.push(themeHref(selected));
    };
    return (
      <section aria-labelledby="ideas-title" className="max-w-2xl">
        <h1 id="ideas-title" className="font-display text-4xl">
          {copy.ideas.picker.title}
        </h1>
        <p className="mt-2 text-ink-secondary">{copy.ideas.picker.lead}</p>
        <form onSubmit={submit} className="mt-6 space-y-6">
          <ThemePicker
            copy={copy.ideas.picker}
            value={selected}
            onChange={setChoice}
          />
          <Button type="submit" className="w-full sm:w-auto">
            {copy.ideas.picker.submit} <span aria-hidden="true">→</span>
          </Button>
        </form>
      </section>
    );
  }

  const loading = !ideas && !failed;
  const status = failed
    ? ""
    : !ideas
      ? copy.ideas.finding
      : ideas.length === 0
        ? copy.ideas.none
        : plural(copy.ideas.found, ideas.length, locale);

  // Stays while other ideas load, so keyboard focus isn't lost.
  const canTryOthers = (ideas?.length ?? 0) > 0 || (loading && attempt > 0);

  // Shown ideas move to the end of `exclude`, so the mock offers unseen ones
  // first, then the ones shown longest ago.
  function tryOthers() {
    if (!theme || !ideas) return;
    const shown = ideas.map((idea) => idea.id);
    setAsk({
      theme,
      exclude: [...exclude.filter((seen) => !shown.includes(seen)), ...shown],
      attempt: attempt + 1,
    });
  }

  function retry() {
    if (theme) setAsk({ theme, exclude, attempt: attempt + 1 });
  }

  return (
    <section aria-labelledby="ideas-title">
      <h1 id="ideas-title" className="font-display text-4xl">
        {copy.ideas.title}
      </h1>
      <ThemePicker
        copy={copy.ideas.picker}
        variant="compact"
        value={theme}
        onChange={switchTheme}
        className="mt-4"
      />
      <output className="mt-6 block text-sm font-semibold">{status}</output>

      {failed && (
        <div
          role="alert"
          className="mt-4 max-w-xl rounded-card border-[2.5px] border-ink bg-card p-6 shadow-card"
        >
          <h2 className="font-display text-2xl">{copy.ideas.failed.title}</h2>
          <p className="mt-2 text-ink-secondary">{copy.ideas.failed.body}</p>
          <Button className="mt-5" onClick={retry}>
            {copy.ideas.failed.retry}
          </Button>
        </div>
      )}

      {loading && (
        <div aria-hidden="true" className="mt-4 grid gap-5 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-card border-2 border-line bg-callout motion-reduce:animate-none"
            />
          ))}
        </div>
      )}

      {ideas && ideas.length > 0 && (
        <ol className="mt-4 grid gap-5 lg:grid-cols-3">
          {ideas.map((idea, index) => (
            <li key={idea.id}>
              <IdeaCard
                idea={idea}
                index={index + 1}
                total={ideas.length}
                href={`/${locale}/scan/${id}/ideas/${idea.id}?${query}`}
                copy={copy}
                locale={locale}
              />
            </li>
          ))}
        </ol>
      )}

      {canTryOthers && (
        <Button
          variant="secondary"
          aria-disabled={!ideas}
          onClick={tryOthers}
          className="mt-6 aria-disabled:opacity-50"
        >
          {copy.ideas.again}
        </Button>
      )}
    </section>
  );
}
