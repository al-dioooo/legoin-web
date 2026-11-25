"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BuildPreview } from "@/components/ideas/build-preview";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill, formatDate } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { listPictureBuilds } from "@/lib/api";
import type { PictureBuild } from "@/lib/domain";

type Copy = {
  list: Dictionary["picture"]["list"];
  previewAlt: string;
};

/** The account's picture builds, newest first, each opening its page. */
export function PictureList({ copy, locale }: { copy: Copy; locale: Locale }) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    attempt: number;
    builds: PictureBuild[] | "failed";
  } | null>(null);

  useEffect(() => {
    let active = true;
    const loaded = attempt;
    void listPictureBuilds().then(
      (list) => active && setResult({ attempt: loaded, builds: list }),
      () => active && setResult({ attempt: loaded, builds: "failed" }),
    );
    return () => {
      active = false;
    };
  }, [attempt]);
  // "Try again" shows loading until its own answer comes.
  const builds = result?.attempt === attempt ? result.builds : "loading";

  return (
    <section
      aria-labelledby="picture-list-title"
      className="rounded-card border-[2.5px] border-ink bg-card p-5 shadow-card"
    >
      <h2 id="picture-list-title" className="font-display text-xl">
        {copy.list.title}
      </h2>
      {builds === "loading" ? (
        <p className="mt-3 text-ink-secondary" aria-busy="true">
          {copy.list.loading}
        </p>
      ) : builds === "failed" ? (
        <div className="mt-3 space-y-3">
          <p>{copy.list.failed}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setAttempt((count) => count + 1)}
          >
            {copy.list.retry}
          </Button>
        </div>
      ) : builds.length === 0 ? (
        <p className="mt-3 text-ink-secondary">{copy.list.empty}</p>
      ) : (
        <ul className="assemble mt-4 grid grid-cols-2 gap-3">
          {builds.map((build) => (
            <li key={build.id}>
              <Link
                href={`/${locale}/picture/${encodeURIComponent(build.id)}`}
                className="flex h-full flex-col gap-2 rounded-callout p-1 hover:bg-highlight-subtle"
              >
                <BuildPreview
                  preview={build.preview}
                  alt={fill(copy.previewAlt, { title: build.title })}
                  size="card"
                />
                <span
                  lang={build.locale}
                  className="font-semibold leading-snug"
                >
                  {build.title}
                </span>
                <span className="text-xs text-ink-secondary">
                  {formatDate(build.createdAt, locale)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
