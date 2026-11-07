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
import {
  SharedPhoto,
  STEP_FORWARD,
} from "@/components/motion/view-transitions";
import { ScanFailureView } from "@/components/scan/scan-failure";
import { ScanProgress } from "@/components/scan/scan-progress";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/locales";
import { cx } from "@/lib/cx";
import type { Photo, ScanFailure, ScanStage } from "@/lib/domain";
import {
  createScan,
  MockApiError,
  mockOptionsFromSearch,
} from "@/lib/mock/api";
import { EVENING_PHOTO } from "@/lib/mock/fixtures";
import { readPhoto, validatePhoto } from "@/lib/photo";
import { handOffScan } from "@/lib/scan-handoff";

type Copy = Pick<
  Dictionary["scan"],
  "capture" | "errors" | "progress" | "failures"
>;

type Chosen = { photo: Photo; alt: string };

type Status =
  | { kind: "idle" }
  | { kind: "scanning"; stage: ScanStage }
  | { kind: "failed"; reason: ScanFailure };

/**
 * Camera, file or drag-and-drop, a preview to retake or scan (PRD F1), then the
 * pipeline's progress and, if it fails, what to do next. The photo is one
 * shared element throughout: view changes run as transitions, so it morphs
 * from the preview into the scanner and on into the results.
 */
export function CaptureFlow({ copy, locale }: { copy: Copy; locale: Locale }) {
  const router = useRouter();
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const takeButton = useRef<HTMLButtonElement>(null);
  const scanButton = useRef<HTMLButtonElement>(null);
  const abort = useRef<AbortController | null>(null);
  const [chosen, setChosen] = useState<Chosen | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  // The one magnetic control: the step's main action. The ref also keeps the
  // button for focus, and lets go of both when it unmounts.
  const magnet = useMagnetic();
  const scanButtonRef = useCallback(
    (node: HTMLButtonElement | null) => {
      scanButton.current = node;
      const release = magnet(node);
      return () => {
        scanButton.current = null;
        release?.();
      };
    },
    [magnet],
  );

  const view = !chosen
    ? "choose"
    : status.kind === "idle"
      ? "preview"
      : status.kind;
  const scanning = status.kind === "scanning";

  // Keep keyboard focus on the next thing to do after the view swaps.
  // The progress and failure views focus their own headings.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (view === "choose") takeButton.current?.focus();
    if (view === "preview") scanButton.current?.focus();
  }, [view]);

  useEffect(() => {
    if (!scanning) return;
    const started = Date.now();
    const timer = setInterval(
      () => setElapsed(Math.floor((Date.now() - started) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, [scanning]);

  // Leaving the page stops a scan in progress.
  useEffect(() => () => abort.current?.abort(), []);

  async function choose(file: File | undefined) {
    if (!file) return;
    const problem = validatePhoto(file);
    if (problem) {
      setError(copy.errors[problem]);
      return;
    }
    try {
      const photo = await readPhoto(file);
      setError(null);
      setChosen({ photo, alt: copy.capture.previewAlt });
    } catch {
      setError(copy.errors.read);
    }
  }

  function chooseSample() {
    setError(null);
    setChosen({ photo: EVENING_PHOTO, alt: copy.capture.sampleAlt });
  }

  function retake() {
    setChosen(null);
    setError(null);
    setStatus({ kind: "idle" });
  }

  function cancel() {
    abort.current?.abort();
    startTransition(() => setStatus({ kind: "idle" }));
  }

  async function scan() {
    if (!chosen) return;
    const controller = new AbortController();
    abort.current = controller;
    setError(null);
    setElapsed(0);
    const showStage = (stage: ScanStage) =>
      startTransition(() => setStatus({ kind: "scanning", stage }));
    showStage("detecting");
    try {
      const result = await createScan(chosen.photo, {
        ...mockOptionsFromSearch(window.location.search),
        signal: controller.signal,
        onStage: showStage,
      });
      handOffScan(result);
      router.push(`/${locale}/scan/${result.id}`, {
        transitionTypes: [STEP_FORWARD],
      });
    } catch (caught) {
      // Cancelled: the preview is already back.
      if (controller.signal.aborted) return;
      if (caught instanceof MockApiError) {
        setStatus({ kind: "failed", reason: caught.reason });
      } else {
        setStatus({ kind: "idle" });
        setError(copy.errors.generic);
      }
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    void choose(event.dataTransfer.files[0]);
  }

  return (
    <section aria-labelledby="capture-title">
      <h2 id="capture-title" className="sr-only">
        {copy.capture.title}
      </h2>

      {status.kind === "scanning" && chosen ? (
        <ScanProgress
          photo={chosen.photo}
          stage={status.stage}
          elapsedSeconds={elapsed}
          copy={copy.progress}
          onCancel={cancel}
        />
      ) : status.kind === "failed" ? (
        <ScanFailureView
          reason={status.reason}
          copy={copy.failures}
          onRetake={retake}
          onRetry={scan}
        />
      ) : chosen ? (
        <div className="click-in rounded-card border-[2.5px] border-ink bg-card p-4 shadow-card sm:p-5">
          <SharedPhoto>
            <div className="overflow-hidden rounded-callout border-[2.5px] border-ink">
              <Image
                src={chosen.photo.src}
                width={chosen.photo.width}
                height={chosen.photo.height}
                alt={chosen.alt}
                unoptimized
                className="block h-auto max-h-[60vh] w-full object-contain"
              />
            </div>
          </SharedPhoto>
          <div className="mt-stud flex flex-wrap gap-3">
            <Button ref={scanButtonRef} onClick={scan}>
              {copy.capture.submit}
            </Button>
            <Button variant="secondary" onClick={retake}>
              {copy.capture.retake}
            </Button>
          </div>
        </div>
      ) : (
        // Drag and drop is a desktop shortcut; the buttons cover every input method.
        // biome-ignore lint/a11y/noStaticElementInteractions: drop target only, the buttons inside are the accessible controls
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
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
            >
              {copy.capture.take}
            </Button>
            <Button
              variant="secondary"
              onClick={() => fileInput.current?.click()}
            >
              {copy.capture.choose}
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={chooseSample}>
            {copy.capture.sample}
          </Button>
          <p className="text-sm text-ink-secondary">{copy.capture.hint}</p>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-danger">
          {error}
        </p>
      )}

      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
        onChange={(event) => {
          void choose(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        tabIndex={-1}
        aria-hidden="true"
        className="hidden"
        onChange={(event) => {
          void choose(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </section>
  );
}
