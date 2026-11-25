"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ConfirmDelete } from "@/components/history/confirm-delete";
import { BuildPreview } from "@/components/ideas/build-preview";
import { BuildSteps } from "@/components/ideas/build-steps";
import { MissingSummary } from "@/components/ideas/missing-summary";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { EmptyState, EmptyStateIcon } from "@/components/ui/empty-state";
import { PartCallout } from "@/components/ui/part-callout";
import { Select } from "@/components/ui/select";
import { Sticker } from "@/components/ui/sticker";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill, formatDate, plural } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { deletePictureBuild, getPictureBuild, listScans } from "@/lib/api";
import type { PartCount } from "@/lib/bricks";
import { cx } from "@/lib/cx";
import type { PictureBuild, PictureCheck, Scan } from "@/lib/domain";

type Copy = {
  result: Dictionary["picture"]["result"];
  summary: Dictionary["ideaDetail"]["summary"];
  steps: Pick<Dictionary["ideaDetail"], "markDone" | "progress" | "allDone">;
  common: Pick<
    Dictionary["common"],
    "step" | "pieces" | "partsUsed" | "partsMissing"
  >;
};

type View =
  | { kind: "ready"; build: PictureBuild }
  | { kind: "missing" }
  | { kind: "failed" };

type Checking =
  | { kind: "none" }
  | { kind: "loading"; scanId: string }
  | { kind: "ready"; check: PictureCheck }
  | { kind: "failed"; scanId: string };

const pieceCount = (parts: PartCount[]) =>
  parts.reduce((total, line) => total + line.quantity, 0);

export function PictureResultLoading({ label }: { label: string }) {
  return (
    <div className="max-w-2xl space-y-4" aria-busy="true">
      <p className="text-ink-secondary">{label}</p>
      <div className="h-14 w-3/4 animate-pulse rounded-callout border-2 border-line bg-callout motion-reduce:animate-none" />
      <div className="aspect-square max-w-72 animate-pulse rounded-callout border-2 border-line bg-callout motion-reduce:animate-none" />
    </div>
  );
}

/**
 * One picture build in full (ADR-0012), laid out like an idea's booklet page:
 * the rendered build beside the picture it came from, its `.ldr`, every part,
 * and numbered steps that can be ticked off. Picking one of the person's
 * scans checks the parts against it: what they have, and what's missing.
 */
export function PictureResult({
  copy,
  locale,
}: {
  copy: Copy;
  locale: Locale;
}) {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ key: string; view: View } | null>(
    null,
  );
  const [scans, setScans] = useState<Scan[] | null>(null);
  const [checking, setChecking] = useState<Checking>({ kind: "none" });
  const [deleteFailed, setDeleteFailed] = useState(false);
  const failedHeading = useRef<HTMLHeadingElement>(null);

  // "Try again" loads again; a result counts only for what it was loaded for.
  const key = `${id}/${attempt}`;
  useEffect(() => {
    let active = true;
    const loaded = `${id}/${attempt}`;
    void getPictureBuild(id).then(
      (build) =>
        active &&
        setResult({
          key: loaded,
          view: build ? { kind: "ready", build } : { kind: "missing" },
        }),
      () => active && setResult({ key: loaded, view: { kind: "failed" } }),
    );
    return () => {
      active = false;
    };
  }, [id, attempt]);
  const view = result?.key === key ? result.view : null;

  useEffect(() => {
    let active = true;
    void listScans().then(
      (list) => active && setScans(list),
      () => active && setScans([]),
    );
    return () => {
      active = false;
    };
  }, []);

  const failed = view?.kind === "failed";
  useEffect(() => {
    if (failed) failedHeading.current?.focus();
  }, [failed]);

  async function check(scanId: string) {
    if (!scanId) {
      setChecking({ kind: "none" });
      return;
    }
    setChecking({ kind: "loading", scanId });
    try {
      const build = await getPictureBuild(id, { scanId });
      setChecking(
        build?.check
          ? { kind: "ready", check: build.check }
          : { kind: "failed", scanId },
      );
    } catch {
      setChecking({ kind: "failed", scanId });
    }
  }

  async function remove() {
    try {
      await deletePictureBuild(id);
      router.push(`/${locale}/picture`);
      return true;
    } catch {
      setDeleteFailed(true);
      return false;
    }
  }

  if (!view) return <PictureResultLoading label={copy.result.loading} />;

  if (view.kind === "missing") {
    return (
      <EmptyState
        as="h1"
        icon={<EmptyStateIcon />}
        title={copy.result.missing.title}
        body={copy.result.missing.body}
        actions={
          <Link href={`/${locale}/picture`} className={buttonStyles()}>
            {copy.result.missing.action}
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
        title={copy.result.failed.title}
        body={copy.result.failed.body}
        actions={
          <Button onClick={() => setAttempt((count) => count + 1)}>
            {copy.result.failed.retry}
          </Button>
        }
      />
    );
  }

  const { build } = view;
  // The build's own words keep their language; everything around them is UI copy.
  const written = build.locale;
  const pieces = pieceCount(build.parts);
  const selected =
    checking.kind === "ready"
      ? checking.check.scanId
      : checking.kind === "none"
        ? ""
        : checking.scanId;

  return (
    <article
      aria-labelledby="picture-title"
      className="grid gap-y-[calc(var(--stud)*1.5)] lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-stud"
    >
      <header className="click-in lg:col-span-7 lg:row-start-1">
        <Link
          href={`/${locale}/picture`}
          className={cx(
            buttonStyles({ variant: "ghost", size: "sm" }),
            "-ml-4",
          )}
        >
          <span aria-hidden="true">←</span> {copy.result.back}
        </Link>
        <p className="mt-3 font-mono text-xs font-bold tracking-[0.2em] uppercase">
          {copy.result.eyebrow} · {plural(copy.common.pieces, pieces, locale)}
        </p>
        <h1
          id="picture-title"
          lang={written}
          className="mt-3 pr-[4.5rem] font-display text-3xl leading-tight sm:pr-0 sm:text-5xl"
        >
          <Sticker className="-rotate-2">{build.title}</Sticker>
        </h1>
        <p lang={written} className="mt-4 max-w-prose text-lg">
          {build.summary}
        </p>
        {written !== locale && (
          <p className="mt-3 max-w-prose text-ink-secondary">
            {fill(copy.result.language.note, {
              language: copy.result.language.names[written],
            })}
          </p>
        )}
        <figure className="mt-stud max-w-xs">
          <div className="overflow-hidden rounded-callout border-[2.5px] border-ink">
            <Image
              src={build.picture.src}
              width={build.picture.width}
              height={build.picture.height}
              alt={copy.result.pictureAlt}
              unoptimized
              className="block h-auto w-full"
            />
          </div>
          <figcaption className="mt-2 text-sm text-ink-secondary">
            {formatDate(build.createdAt, locale)}
          </figcaption>
        </figure>
      </header>

      <aside className="assemble space-y-stud lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
        <div>
          <BuildPreview
            preview={build.preview}
            alt={fill(copy.result.previewAlt, { title: build.title })}
            size="page"
          />
          <a
            href={build.preview.model}
            download="legoin-picture-build.ldr"
            className={cx(
              buttonStyles({ variant: "secondary", size: "sm" }),
              "mt-3",
            )}
          >
            {copy.result.model}
          </a>
          <p className="mt-2 max-w-72 text-xs text-ink-secondary">
            {copy.result.credit}
          </p>
        </div>
        <PartCallout
          title={copy.result.parts}
          parts={build.parts}
          locale={locale}
          detailed
        />
        <section aria-labelledby="picture-check-title" className="space-y-4">
          <div className="space-y-4 rounded-callout border-2 border-ink bg-card p-4">
            <h2 id="picture-check-title" className="font-display text-xl">
              {copy.result.check.title}
            </h2>
            {scans && scans.length === 0 ? (
              <div className="space-y-3">
                <p className="text-ink-secondary">
                  {copy.result.check.noScans}
                </p>
                <Link
                  href={`/${locale}/scan`}
                  className={buttonStyles({ variant: "secondary", size: "sm" })}
                >
                  {copy.result.check.scanAction}
                </Link>
              </div>
            ) : (
              <Select
                label={copy.result.check.label}
                value={selected}
                disabled={!scans}
                onChange={(event) => void check(event.target.value)}
              >
                <option value="">{copy.result.check.choose}</option>
                {scans?.map((scan) => (
                  <option key={scan.id} value={scan.id}>
                    {fill(copy.result.check.scan, {
                      date: formatDate(scan.createdAt, locale),
                      pieces: plural(
                        copy.common.pieces,
                        scan.detections.length,
                        locale,
                      ),
                    })}
                  </option>
                ))}
              </Select>
            )}
            <div aria-live="polite">
              {checking.kind === "loading" && (
                <p className="text-ink-secondary">
                  {copy.result.check.loading}
                </p>
              )}
              {checking.kind === "failed" && (
                <p className="font-semibold text-danger">
                  {copy.result.check.failed}
                </p>
              )}
            </div>
          </div>
          {checking.kind === "ready" && (
            <div className="space-y-4">
              {checking.check.used.length > 0 && (
                <PartCallout
                  title={copy.common.partsUsed}
                  parts={checking.check.used}
                  locale={locale}
                  detailed
                />
              )}
              <MissingSummary
                used={pieceCount(checking.check.used)}
                missing={pieceCount(checking.check.missing)}
                parts={checking.check.missing}
                copy={{
                  summary: copy.summary,
                  partsMissing: copy.common.partsMissing,
                }}
                locale={locale}
              />
            </div>
          )}
        </section>
        <div className="space-y-2">
          <ConfirmDelete
            copy={copy.result.delete}
            context={build.title}
            onConfirm={remove}
          />
          {deleteFailed && (
            <p role="alert" className="text-sm font-semibold text-danger">
              {copy.result.delete.failed}
            </p>
          )}
        </div>
      </aside>

      <section
        aria-labelledby="picture-steps-title"
        className="lg:col-span-7 lg:row-start-2"
      >
        <h2 id="picture-steps-title" className="click-in font-display text-xl">
          <Sticker tone="paper" className="rotate-2">
            {copy.result.steps}
          </Sticker>
        </h2>
        {build.plain && (
          <p className="mt-stud max-w-prose">
            <Badge tone="warning">{copy.result.plain}</Badge>
          </p>
        )}
        <BuildSteps
          key={build.id}
          steps={build.steps}
          lang={written}
          copy={{ ...copy.steps, step: copy.common.step }}
          className="mt-stud"
        />
      </section>
    </article>
  );
}
