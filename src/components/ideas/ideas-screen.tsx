"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { IdeaCard } from "@/components/ideas/idea-card";
import { ThemePicker } from "@/components/ideas/theme-picker";
import { Button, buttonStyles } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { plural } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { type Idea, isTheme, type Scan, type Theme } from "@/lib/domain";
import { getIdeas, getScan, mockOptionsFromSearch } from "@/lib/mock/api";

type Copy = {
  ideas: Dictionary["ideas"];
  results: Pick<Dictionary["results"], "loading" | "missing">;
  common: Pick<Dictionary["common"], "ideaOf" | "missingCount">;
};

type ScanState =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "ready"; scan: Scan };

/** Another ask for the same theme: other ideas or a retry. */
type Ask = { theme: Theme; exclude: string[]; attempt: number };

/** A finished request, kept with the key it was asked under. */
type IdeasResult =
  | { key: string; ideas: Idea[] }
  | { key: string; failed: true };

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
  const [choice, setChoice] = useState<Theme | null>(null);
  const [ask, setAsk] = useState<Ask | null>(null);
  const [result, setResult] = useState<IdeasResult | null>(null);
  // A new theme starts over; asks for an earlier theme no longer apply.
  const current = ask && ask.theme === theme ? ask : null;
  const exclude = current?.exclude ?? NONE;
  const attempt = current?.attempt ?? 0;
  const key = `${theme}:${attempt}`;

  useEffect(() => {
    let active = true;
    void getScan(id, { delayMs: 150 }).then((scan) => {
      if (active)
        setScanState(scan ? { kind: "ready", scan } : { kind: "missing" });
    });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!theme) return;
    let active = true;
    const asked = `${theme}:${attempt}`;
    getIdeas(id, theme, locale, { ...mockOptionsFromSearch(query), exclude })
      .then((ideas) => {
        if (active) setResult({ key: asked, ideas });
      })
      .catch(() => {
        if (active) setResult({ key: asked, failed: true });
      });
    return () => {
      active = false;
    };
  }, [id, theme, locale, query, exclude, attempt]);

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
      <section className="max-w-xl rounded-card border-[2.5px] border-ink bg-card p-6 shadow-card">
        <h1 className="font-display text-3xl">{copy.ideas.empty.title}</h1>
        <p className="mt-2 text-ink-secondary">{copy.ideas.empty.body}</p>
        <Link
          href={`/${locale}/scan/${id}`}
          className={`${buttonStyles()} mt-5`}
        >
          {copy.ideas.empty.action}
        </Link>
      </section>
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

  const view = result?.key === key ? result : null;
  const ideas = view && "ideas" in view ? view.ideas : null;
  const failed = view !== null && "failed" in view;
  const status = failed
    ? ""
    : !ideas
      ? copy.ideas.finding
      : ideas.length === 0
        ? copy.ideas.none
        : plural(copy.ideas.found, ideas.length, locale);

  // Stays while other ideas load, so keyboard focus isn't lost.
  const canTryOthers = (ideas?.length ?? 0) > 0 || (!view && attempt > 0);

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

      {!view && (
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
