"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type DragEvent,
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { LogoMark } from "@/components/brand/logo";
import { useMagnetic } from "@/components/motion/magnetic";
import { PiecesApart } from "@/components/motion/pieces-apart";
import { StageMark, type StageState } from "@/components/scan/scan-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { plural } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { createPictureBuild, getPictureQuota, PictureError } from "@/lib/api";
import { cx } from "@/lib/cx";
import {
  type Photo,
  PICTURE_STAGES,
  type PictureFailure,
  type PictureQuota,
  type PictureStage,
} from "@/lib/domain";
import { readPhoto, validatePhoto } from "@/lib/photo";

type Copy = Pick<
  Dictionary["picture"],
  "privacy" | "quota" | "capture" | "errors" | "progress" | "failures"
> & { generic: string };

type Status =
  | { kind: "idle" }
  | { kind: "designing"; stage: PictureStage }
  | { kind: "failed"; reason: PictureFailure };

/** Failures where the same picture may work on a second try. */
const RETRYABLE: PictureFailure[] = [
  "no_valid_build",
  "timeout",
  "unavailable",
  "network",
];

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/**
 * Picture to LEGO (ADR-0012): the day's quota and the privacy note first, then
 * a picture from the camera, a file or a drop, then the job's four stages
 * while the build is designed, and on to the build. The note says the picture
 * goes to Anthropic before anything is chosen or sent.
 */
export function PictureFlow({ copy, locale }: { copy: Copy; locale: Locale }) {
  const router = useRouter();
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const takeButton = useRef<HTMLButtonElement>(null);
  const designButton = useRef<HTMLButtonElement>(null);
  const abort = useRef<AbortController | null>(null);
  const [quota, setQuota] = useState<PictureQuota | "loading" | "failed">(
    "loading",
  );
  const [chosen, setChosen] = useState<Photo | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const magnet = useMagnetic();
  const designButtonRef = useCallback(
    (node: HTMLButtonElement | null) => {
      designButton.current = node;
      const release = magnet(node);
      return () => {
        designButton.current = null;
        release?.();
      };
    },
    [magnet],
  );

  const designing = status.kind === "designing";
  const view = !chosen
    ? "choose"
    : status.kind === "idle"
      ? "preview"
      : status.kind;

  useEffect(() => {
    let active = true;
    getPictureQuota().then(
      (answer) => active && setQuota(answer),
      () => active && setQuota("failed"),
    );
    return () => {
      active = false;
    };
  }, []);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (view === "choose") takeButton.current?.focus();
    if (view === "preview") designButton.current?.focus();
  }, [view]);

  useEffect(() => {
    if (!designing) return;
    const started = Date.now();
    const timer = setInterval(
      () => setElapsed(Math.floor((Date.now() - started) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, [designing]);

  // Leaving the page cancels a build in progress.
  useEffect(() => () => abort.current?.abort(), []);

  // A quota that couldn't be read doesn't stop anyone: the upload says why.
  const blocked =
    typeof quota === "object" && !quota.available ? quota.reason : undefined;

  async function choose(file: File | undefined) {
    if (!file) return;
    const problem = validatePhoto(file);
    if (problem) {
      setError(copy.errors[problem]);
      return;
    }
    try {
      const picture = await readPhoto(file);
      setError(null);
      setChosen(picture);
    } catch {
      setError(copy.errors.read);
    }
  }

  function reset() {
    setChosen(null);
    setError(null);
    setStatus({ kind: "idle" });
  }

  function cancel() {
    abort.current?.abort();
    startTransition(() => setStatus({ kind: "idle" }));
  }

  async function design() {
    if (!chosen) return;
    const controller = new AbortController();
    abort.current = controller;
    setError(null);
    setElapsed(0);
    const showStage = (stage: PictureStage) =>
      startTransition(() => setStatus({ kind: "designing", stage }));
    showStage("queued");
    try {
      const build = await createPictureBuild(chosen, locale, {
        signal: controller.signal,
        onStage: showStage,
      });
      // Next keeps this page's state for the way back: start it over, so
      // coming back shows the upload, not this job's progress.
      startTransition(() => {
        setChosen(null);
        setStatus({ kind: "idle" });
      });
      router.push(`/${locale}/picture/${encodeURIComponent(build.id)}`);
    } catch (caught) {
      if (controller.signal.aborted) return;
      if (caught instanceof PictureError) {
        setStatus({ kind: "failed", reason: caught.reason });
      } else {
        setStatus({ kind: "idle" });
        setError(copy.generic);
      }
    } finally {
      // The quota moved on, or was given back.
      getPictureQuota().then(setQuota, () => {});
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (!blocked) void choose(event.dataTransfer.files[0]);
  }

  return (
    <section aria-labelledby="picture-capture-title" className="space-y-stud">
      <h2 id="picture-capture-title" className="sr-only">
        {copy.capture.title}
      </h2>

      {status.kind === "designing" && chosen ? (
        <Progress
          picture={chosen}
          stage={status.stage}
          elapsedSeconds={elapsed}
          copy={copy.progress}
          onCancel={cancel}
        />
      ) : status.kind === "failed" ? (
        <Failure
          reason={status.reason}
          copy={copy.failures}
          onRetry={design}
          onOther={reset}
        />
      ) : (
        <>
          <Quota quota={quota} copy={copy.quota} locale={locale} />
          <PrivacyNote copy={copy.privacy} />
          {chosen ? (
            <div className="click-in rounded-card border-[2.5px] border-ink bg-card p-4 shadow-card sm:p-5">
              <div className="overflow-hidden rounded-callout border-[2.5px] border-ink">
                <Image
                  src={chosen.src}
                  width={chosen.width}
                  height={chosen.height}
                  alt={copy.capture.previewAlt}
                  unoptimized
                  className="block h-auto max-h-[60vh] w-full object-contain"
                />
              </div>
              <div className="mt-stud flex flex-wrap gap-3">
                <Button
                  ref={designButtonRef}
                  onClick={design}
                  disabled={Boolean(blocked)}
                >
                  {copy.capture.submit}
                </Button>
                <Button variant="secondary" onClick={reset}>
                  {copy.capture.change}
                </Button>
              </div>
            </div>
          ) : (
            // Drag and drop is a desktop shortcut; the buttons cover every input.
            // biome-ignore lint/a11y/noStaticElementInteractions: drop target only, the buttons inside are the accessible controls
            <div
              onDragOver={(event) => {
                event.preventDefault();
                if (!blocked) setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cx(
                "flex flex-col items-center gap-4 rounded-card border-[2.5px] border-dashed border-ink p-6 text-center transition-colors sm:p-10",
                dragging ? "bg-highlight-subtle" : "bg-card",
              )}
            >
              <LogoMark className="size-14" />
              <p className="font-display text-xl">{copy.capture.drop}</p>
              <p className="text-sm text-ink-secondary">{copy.capture.or}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  ref={takeButton}
                  onClick={() => cameraInput.current?.click()}
                  disabled={Boolean(blocked)}
                >
                  {copy.capture.take}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => fileInput.current?.click()}
                  disabled={Boolean(blocked)}
                >
                  {copy.capture.choose}
                </Button>
              </div>
              <p className="text-sm text-ink-secondary">{copy.capture.hint}</p>
            </div>
          )}
        </>
      )}

      {error && (
        <p role="alert" className="text-sm font-semibold text-danger">
          {error}
        </p>
      )}

      {[cameraInput, fileInput].map((input) => (
        <input
          key={input === cameraInput ? "camera" : "file"}
          ref={input}
          type="file"
          accept="image/*"
          capture={input === cameraInput ? "environment" : undefined}
          tabIndex={-1}
          aria-hidden="true"
          className="hidden"
          onChange={(event) => {
            void choose(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      ))}
    </section>
  );
}

/** What's left today, as a dot and a label; or why nothing can start. */
function Quota({
  quota,
  copy,
  locale,
}: {
  quota: PictureQuota | "loading" | "failed";
  copy: Copy["quota"];
  locale: Locale;
}) {
  if (quota === "failed") return null;
  return (
    <output className="block min-h-7">
      {quota === "loading" ? (
        <span className="text-sm text-ink-secondary">{copy.loading}</span>
      ) : quota.available ? (
        <Badge tone="success">
          {plural(copy.left, quota.limit - quota.used, locale)}
        </Badge>
      ) : (
        <Badge tone="warning">{copy[quota.reason ?? "off"]}</Badge>
      )}
    </output>
  );
}

/** Says where the picture goes, before one is chosen or sent. */
function PrivacyNote({ copy }: { copy: Copy["privacy"] }) {
  return (
    <aside
      aria-labelledby="picture-privacy-title"
      className="rounded-callout border-2 border-ink bg-highlight-subtle p-4"
    >
      <h3 id="picture-privacy-title" className="font-semibold">
        {copy.title}
      </h3>
      <p className="mt-1 max-w-prose">{copy.body}</p>
    </aside>
  );
}

/** The job's four stages, with the picture, the time and a way out. */
function Progress({
  picture,
  stage,
  elapsedSeconds,
  copy,
  onCancel,
}: {
  picture: Photo;
  stage: PictureStage;
  elapsedSeconds: number;
  copy: Copy["progress"];
  onCancel: () => void;
}) {
  const current = PICTURE_STAGES.indexOf(stage);
  const heading = useRef<HTMLHeadingElement>(null);
  // The button that had focus is gone; hand focus to this view.
  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <section
      aria-labelledby="picture-progress-title"
      className="click-in rounded-card border-[2.5px] border-ink bg-card p-4 shadow-card sm:p-5"
    >
      <div className="grid gap-stud sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:items-start">
        <div className="overflow-hidden rounded-callout border-[2.5px] border-ink">
          <Image
            src={picture.src}
            width={picture.width}
            height={picture.height}
            alt={copy.pictureAlt}
            unoptimized
            className="block h-auto w-full"
          />
        </div>
        <div>
          <h2
            ref={heading}
            id="picture-progress-title"
            tabIndex={-1}
            className="font-display text-2xl outline-none"
          >
            {copy.title}
          </h2>
          <ol className="mt-4 space-y-3">
            {PICTURE_STAGES.map((name, index) => {
              const state: StageState =
                index < current
                  ? "done"
                  : index === current
                    ? "current"
                    : "waiting";
              return (
                <li key={name} className="flex items-center gap-3">
                  <StageMark state={state} />
                  <span
                    className={cx(
                      "font-semibold",
                      state === "waiting" && "text-ink-secondary",
                    )}
                  >
                    {copy.stages[name]}
                  </span>
                  <span className="sr-only">({copy.status[state]})</span>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 text-sm text-ink-secondary">{copy.note}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="font-mono text-sm">
              <span className="text-ink-secondary">{copy.elapsed}</span>{" "}
              <span className="font-bold tabular-nums">
                {clock(elapsedSeconds)}
              </span>
            </p>
            <Button variant="secondary" onClick={onCancel}>
              {copy.cancel}
            </Button>
          </div>
        </div>
      </div>
      <div aria-live="polite" className="sr-only">
        {copy.stages[stage]}
      </div>
    </section>
  );
}

/** What went wrong, and the way forward for that reason. */
function Failure({
  reason,
  copy,
  onRetry,
  onOther,
}: {
  reason: PictureFailure;
  copy: Copy["failures"];
  onRetry: () => void;
  onOther: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  const message = copy[reason];
  const canRetry = RETRYABLE.includes(reason);
  return (
    <section
      aria-labelledby="picture-failure-title"
      className="click-in flex flex-col-reverse gap-stud rounded-card border-[2.5px] border-ink bg-danger-subtle p-5 shadow-card sm:flex-row sm:items-start sm:justify-between sm:p-6"
    >
      <div>
        <h2
          ref={heading}
          id="picture-failure-title"
          tabIndex={-1}
          className="font-display text-2xl outline-none"
        >
          {message.title}
        </h2>
        <p className="mt-2 max-w-xl">{message.body}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {canRetry && <Button onClick={onRetry}>{copy.retry}</Button>}
          <Button
            variant={canRetry ? "secondary" : "primary"}
            onClick={onOther}
          >
            {copy.other}
          </Button>
        </div>
      </div>
      <PiecesApart />
    </section>
  );
}
