"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { ThemePicker } from "@/components/ideas/theme-picker";
import { Button, buttonStyles } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/locales";
import { type Idea, isTheme, type Scan, type Theme } from "@/lib/domain";
import { getIdeas, getScan, mockOptionsFromSearch } from "@/lib/mock/api";

type Copy = {
  ideas: Dictionary["ideas"];
  results: Pick<Dictionary["results"], "loading" | "missing">;
};

type ScanState =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "ready"; scan: Scan };

/** Ideas for one theme; kept with the theme they were asked for. */
type IdeasState = { theme: Theme; ideas: Idea[] };

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
  const [result, setResult] = useState<IdeasState | null>(null);

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
    void getIdeas(id, theme, locale, mockOptionsFromSearch(query)).then(
      (ideas) => {
        if (active) setResult({ theme, ideas });
      },
    );
    return () => {
      active = false;
    };
  }, [id, theme, locale, query]);

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

  const ideas = result?.theme === theme ? result.ideas : null;

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
      <div className="mt-6">
        {ideas ? (
          <ul className="list-disc space-y-1 pl-5">
            {ideas.map((idea) => (
              <li key={idea.id}>{idea.title}</li>
            ))}
          </ul>
        ) : (
          <output className="text-ink-secondary">{copy.ideas.finding}</output>
        )}
      </div>
    </section>
  );
}
