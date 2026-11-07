"use client";

/* Live demos for /desain/gerak. Each one uses the real components and tokens,
 * so what you see here is what the app does.
 */

import Image from "next/image";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useMagnetic } from "@/components/motion/magnetic";
import { Count } from "@/components/motion/odometer";
import { PiecesApart } from "@/components/motion/pieces-apart";
import {
  MotionPreview,
  useReducedMotion,
} from "@/components/motion/reduced-motion";
import { ScannerSweep } from "@/components/motion/scanner";
import { StudGlow } from "@/components/motion/stud-glow";
import { BrickGlyph } from "@/components/ui/brick-glyph";
import { Button } from "@/components/ui/button";
import { DetectedPhoto } from "@/components/ui/detected-photo";
import { InventoryList } from "@/components/ui/inventory-list";
import type { Plural } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import type { BrickColorId, BrickPartId, PartCount } from "@/lib/bricks";
import { cx } from "@/lib/cx";
import { labeledBoxes } from "@/lib/detection-labels";
import { inventoryKey, toInventory } from "@/lib/inventory";
import { readDuration, snapHaptic } from "@/lib/motion";
import { SAMPLE_DETECTIONS, SAMPLE_PHOTO } from "@/lib/sample-scan";

/**
 * The showcase page on a baseplate, with a switch, floating at the bottom,
 * that previews reduced motion for everything inside it. The system setting
 * always wins.
 */
export function MotionShowcase({
  reduceLabel,
  children,
}: {
  reduceLabel: string;
  children: ReactNode;
}) {
  const [preview, setPreview] = useState(false);
  const system = useReducedMotion();
  const reduced = preview || system;
  return (
    <MotionPreview reduced={reduced}>
      <div
        data-motion={preview ? "reduce" : undefined}
        className="baseplate flex flex-1 flex-col overflow-x-clip"
      >
        <StudGlow />
        {children}
        <div className="pointer-events-none sticky bottom-stud z-30 mx-auto mt-auto flex w-full max-w-(--plate-width) justify-end px-stud">
          <button
            type="button"
            aria-pressed={reduced}
            disabled={system}
            onClick={() => setPreview((value) => !value)}
            className="press pointer-events-auto inline-flex min-h-10 items-center gap-2.5 rounded-full border-[2.5px] border-ink bg-page px-4 text-sm font-semibold shadow-sticker [--press:3px] active:shadow-none disabled:opacity-60"
          >
            <span
              aria-hidden="true"
              className={cx(
                "relative h-5 w-9 rounded-full border-2 border-ink transition-colors",
                reduced ? "bg-highlight" : "bg-card",
              )}
            >
              <span
                className={cx(
                  "absolute top-0.5 left-0.5 size-3 rounded-full bg-ink transition-transform duration-200 ease-out-expo",
                  reduced && "translate-x-4",
                )}
              />
            </span>
            {reduceLabel}
          </button>
        </div>
      </div>
    </MotionPreview>
  );
}

const TOKENS = {
  durations: [
    "--duration-press",
    "--duration-release",
    "--duration-lift",
    "--duration-click",
    "--duration-exit",
    "--duration-morph",
    "--duration-tick",
    "--duration-tumble",
    "--duration-sweep",
    "--stagger-step",
  ],
  distances: [
    "--click-drop",
    "--click-squash-x",
    "--click-squash-y",
    "--lift-x",
    "--lift-y",
    "--lift-tilt",
    "--pop-scale",
  ],
  curves: ["--ease-drop", "--ease-settle", "--ease-press", "--ease-out-expo"],
} as const;

/** A cubic-bezier() drawn in a unit box, so the curve can be seen. */
function CurvePlot({ value }: { value: string }) {
  const points = /cubic-bezier\(([^)]+)\)/
    .exec(value)?.[1]
    .split(",")
    .map(Number);
  if (!points || points.length !== 4 || points.some(Number.isNaN)) return null;
  const [x1, y1, x2, y2] = points;
  // y grows downward in SVG; leave room for overshoot above 1.
  const y = (value: number) => 1.25 - value;
  return (
    <svg
      aria-hidden="true"
      viewBox="-0.05 -0.05 1.1 1.6"
      className="h-10 w-7 shrink-0 overflow-visible"
    >
      <path
        d={`M0 ${y(0)} L1 ${y(0)} M0 ${y(1)} L1 ${y(1)}`}
        stroke="var(--border)"
        strokeWidth="0.04"
      />
      <path
        d={`M0 ${y(0)} C${x1} ${y(y1)} ${x2} ${y(y2)} 1 ${y(1)}`}
        fill="none"
        stroke="var(--text-primary)"
        strokeWidth="0.08"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Token names with the values in effect here, read from the CSS. */
export function TokenTable({ name, value }: { name: string; value: string }) {
  const table = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [values, setValues] = useState<Record<string, string>>({});

  // biome-ignore lint/correctness/useExhaustiveDependencies: the CSS values change when the preview switches, so read them again then
  useEffect(() => {
    if (!table.current) return;
    const style = getComputedStyle(table.current);
    setValues(
      Object.fromEntries(
        Object.values(TOKENS)
          .flat()
          .map((token) => [token, style.getPropertyValue(token).trim()]),
      ),
    );
  }, [reduced]);

  return (
    <div ref={table} className="grid gap-stud md:grid-cols-2">
      {Object.entries(TOKENS).map(([group, tokens]) => (
        <table
          key={group}
          className={cx(
            "w-full self-start rounded-callout border-2 border-ink bg-card text-left text-sm",
            group === "durations" && "md:row-span-2",
          )}
        >
          <thead>
            <tr className="border-b-2 border-ink font-mono text-xs tracking-[0.2em] uppercase">
              <th scope="col" className="px-3 py-2">
                {name}
              </th>
              <th scope="col" className="px-3 py-2 text-right">
                {value}
              </th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <tr key={token} className="border-t border-line first:border-0">
                <th
                  scope="row"
                  className="px-3 py-1.5 font-mono text-xs font-medium whitespace-nowrap"
                >
                  {token}
                </th>
                <td className="px-3 py-1.5 text-right font-mono text-xs font-bold whitespace-nowrap">
                  {group === "curves" ? (
                    <span className="inline-flex items-center gap-2">
                      <CurvePlot value={values[token] ?? ""} />
                      {values[token]?.replace(/cubic-bezier\(|\)|\s/g, "")}
                    </span>
                  ) : (
                    values[token]
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
}

/** Remounts its children on Replay, so their entrance plays again. */
function Replayable({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const [run, setRun] = useState(0);
  return (
    <div className={className}>
      <div key={run}>{children}</div>
      <Button
        variant="ghost"
        size="sm"
        className="mt-3"
        onClick={() => setRun((value) => value + 1)}
      >
        {label}
      </Button>
    </div>
  );
}

const PLATE_PIECES: { part: BrickPartId; color: BrickColorId }[] = [
  { part: "brick-2x4", color: "red" },
  { part: "brick-2x2", color: "yellow" },
  { part: "plate-1x2", color: "blue" },
  { part: "slope-2x2", color: "green" },
  { part: "brick-1x4", color: "white" },
  { part: "round-1x1", color: "orange" },
  { part: "plate-2x4", color: "black" },
  { part: "brick-1x2", color: "light-gray" },
];

/** A row of parts assembling one after another. */
export function ClickInDemo({ replay }: { replay: string }) {
  return (
    <Replayable label={replay}>
      <ul className="assemble grid grid-cols-4 gap-3 sm:grid-cols-8">
        {PLATE_PIECES.map((piece) => (
          <li
            key={`${piece.part}-${piece.color}`}
            className="grid h-20 place-items-center rounded-callout border-2 border-ink bg-card shadow-sticker"
          >
            <BrickGlyph part={piece.part} color={piece.color} unit={13} />
          </li>
        ))}
      </ul>
    </Replayable>
  );
}

/** Press-fit buttons, one of them magnetic. */
export function PressDemo({
  magnetic,
  plain,
}: {
  magnetic: string;
  plain: string;
}) {
  const magnet = useMagnetic();
  return (
    <div className="flex flex-wrap items-center gap-stud">
      <Button ref={magnet}>{magnetic}</Button>
      <Button variant="highlight">{plain}</Button>
      <Button variant="secondary">{plain}</Button>
    </div>
  );
}

const SAMPLE_PIECES = SAMPLE_DETECTIONS.map((detection, index) => ({
  ...detection,
  id: `sample-${index}`,
}));

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Select, remove and bring back pieces on the sample photo. */
export function PickDemo({
  locale,
  alt,
  remove,
  undo,
}: {
  locale: Locale;
  alt: string;
  remove: string;
  undo: string;
}) {
  const [removed, setRemoved] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(
    SAMPLE_PIECES[0].id,
  );
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const pieces = SAMPLE_PIECES.filter((piece) => !removed.includes(piece.id));
  const selected = pieces.find((piece) => piece.id === selectedId);

  function select(id: string) {
    if (id !== selectedId) snapHaptic();
    setSelectedId(id);
  }

  async function popOff() {
    if (!selected) return;
    setLeavingId(selected.id);
    await wait(readDuration("--duration-exit"));
    setRemoved((ids) => [...ids, selected.id]);
    setLeavingId(null);
    setSelectedId(null);
  }

  function clickBack() {
    const last = removed.at(-1);
    if (!last) return;
    snapHaptic();
    setRemoved((ids) => ids.slice(0, -1));
    setSelectedId(last);
  }

  function selectLine(line: PartCount) {
    const piece = pieces.find(
      (candidate) => inventoryKey(candidate) === inventoryKey(line),
    );
    if (piece) select(piece.id);
  }

  return (
    <div className="grid gap-stud md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <DetectedPhoto
        photo={SAMPLE_PHOTO}
        alt={alt}
        detections={labeledBoxes(pieces, locale, selectedId ?? undefined)}
        onSelect={select}
        assembling={false}
        leavingId={leavingId ?? undefined}
      />
      <div>
        <InventoryList
          items={toInventory(pieces)}
          locale={locale}
          selectedKey={selected ? inventoryKey(selected) : undefined}
          onSelect={selectLine}
          assembling={false}
          leavingKey={
            leavingId && selected?.id === leavingId
              ? inventoryKey(selected)
              : undefined
          }
        />
        <div className="mt-stud flex flex-wrap gap-2">
          <Button
            variant="danger"
            size="sm"
            disabled={!selected || leavingId !== null}
            onClick={popOff}
          >
            {remove}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={removed.length === 0}
            onClick={clickBack}
          >
            {undo}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** A count that rolls as it changes. */
export function CountDemo({
  locale,
  message,
  fewer,
  more,
}: {
  locale: Locale;
  message: Plural;
  fewer: string;
  more: string;
}) {
  const [count, setCount] = useState(8);
  return (
    <div className="flex flex-wrap items-center gap-stud">
      <div className="min-w-56 rounded-callout border-2 border-ink bg-card px-5 py-3 shadow-sticker">
        <Count
          as="p"
          message={message}
          count={count}
          locale={locale}
          className="font-mono text-4xl font-bold"
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={count === 0}
          onClick={() => setCount((value) => Math.max(0, value - 1))}
        >
          {fewer}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCount((value) => value + 1)}
        >
          {more}
        </Button>
      </div>
    </div>
  );
}

/** True while the element is on screen, so demo loops stop when scrolled away. */
function useOnScreen<T extends Element>() {
  const ref = useRef<T>(null);
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, onScreen] as const;
}

/** The scanner beam on the sample photo, running while it's on screen. */
export function ScannerDemo({ alt }: { alt: string }) {
  const [ref, onScreen] = useOnScreen<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="scan-bed relative max-w-xl overflow-hidden rounded-callout border-[2.5px] border-ink"
    >
      <Image
        src={SAMPLE_PHOTO.src}
        width={SAMPLE_PHOTO.width}
        height={SAMPLE_PHOTO.height}
        alt={alt}
        unoptimized
        className="block h-auto w-full"
      />
      {onScreen && <ScannerSweep />}
    </div>
  );
}

/** The failure illustration, replayable. */
export function ApartDemo({ replay }: { replay: string }) {
  return (
    <Replayable label={replay}>
      <div className="grid h-40 place-items-center rounded-callout border-2 border-ink bg-danger-subtle">
        <PiecesApart />
      </div>
    </Replayable>
  );
}
