"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type DragEvent, useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/locales";
import { cx } from "@/lib/cx";
import type { Photo } from "@/lib/domain";
import { createScan, mockOptionsFromSearch } from "@/lib/mock/api";
import { EVENING_PHOTO } from "@/lib/mock/fixtures";
import { readPhoto, validatePhoto } from "@/lib/photo";

type Copy = Pick<Dictionary["scan"], "capture" | "errors">;

type Chosen = { photo: Photo; alt: string };

/** Camera, file or drag-and-drop, then a preview to retake or scan (PRD F1). */
export function CaptureFlow({ copy, locale }: { copy: Copy; locale: Locale }) {
  const router = useRouter();
  const cameraInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const takeButton = useRef<HTMLButtonElement>(null);
  const scanButton = useRef<HTMLButtonElement>(null);
  const [chosen, setChosen] = useState<Chosen | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const hasChosen = chosen !== null;

  // Keep keyboard focus on the next thing to do after the view swaps.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    (hasChosen ? scanButton : takeButton).current?.focus();
  }, [hasChosen]);

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
  }

  async function scan() {
    if (!chosen) return;
    setScanning(true);
    setError(null);
    try {
      const result = await createScan(
        chosen.photo,
        mockOptionsFromSearch(window.location.search),
      );
      router.push(`/${locale}/scan/${result.id}`);
    } catch {
      setScanning(false);
      setError(copy.errors.generic);
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

      {chosen ? (
        <div className="rounded-card border-[2.5px] border-ink bg-card p-4 shadow-card sm:p-5">
          <Image
            src={chosen.photo.src}
            width={chosen.photo.width}
            height={chosen.photo.height}
            alt={chosen.alt}
            unoptimized
            className="block h-auto max-h-[60vh] w-full rounded-callout border-2 border-ink object-contain"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              ref={scanButton}
              onClick={scan}
              disabled={scanning}
              aria-busy={scanning || undefined}
            >
              {scanning ? copy.capture.scanning : copy.capture.submit}
            </Button>
            <Button variant="secondary" onClick={retake} disabled={scanning}>
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
