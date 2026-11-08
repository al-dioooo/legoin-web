"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { Count, OdometerText } from "@/components/motion/odometer";
import { SharedPhoto } from "@/components/motion/view-transitions";
import { AddPiece } from "@/components/results/add-piece";
import { EditPiece } from "@/components/results/edit-piece";
import { PieceDetail } from "@/components/results/piece-detail";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { DetectedPhoto } from "@/components/ui/detected-photo";
import { EmptyState, EmptyStateIcon } from "@/components/ui/empty-state";
import { InventoryList } from "@/components/ui/inventory-list";
import { Sticker } from "@/components/ui/sticker";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { plural } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { getScan, updateDetections } from "@/lib/api";
import type { BrickColorId, BrickPartId, PartCount } from "@/lib/bricks";
import { cx } from "@/lib/cx";
import {
  countUnplaced,
  fitLabels,
  labeledBoxes,
  zoomFor,
} from "@/lib/detection-labels";
import { type DetectionChange, needsCheck, type Scan } from "@/lib/domain";
import { inventoryKey, inverseChanges, toInventory } from "@/lib/inventory";
import {
  MAX_STAGGER,
  prefersReducedMotion,
  readDuration,
  snapHaptic,
} from "@/lib/motion";
import { forgetHandedOffScan, handedOffScan } from "@/lib/scan-handoff";

type Copy = { results: Dictionary["results"]; common: Dictionary["common"] };

type State =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "ready"; scan: Scan };

export function ResultsLoading({ label }: { label: string }) {
  return (
    <div className="space-y-4" aria-busy="true">
      <p className="text-ink-secondary">{label}</p>
      <div className="aspect-[3/2] max-w-2xl animate-pulse rounded-callout border-2 border-line bg-callout motion-reduce:animate-none" />
    </div>
  );
}

const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, Math.max(ms, 0)));

/** First flagged piece, so the flag is seen. */
const firstToCheck = (scan: Scan | null) =>
  scan?.detections.find(needsCheck)?.id ?? null;

/**
 * A finished scan (PRD F2–F5): the photo with selectable boxes, the inventory,
 * and the selected piece, which can be corrected or removed. Missed pieces can
 * be added, and the last change undone. Changes are saved as they're made.
 *
 * Laid out as a booklet page: the photo plate on the left, the selected piece
 * as a part callout overlapping it, the inventory below. Boxes and tiles click
 * in one by one as the counts roll up; a removed piece pops off and undo clicks
 * it back.
 */
export function ScanResults({ copy, locale }: { copy: Copy; locale: Locale }) {
  const { id } = useParams<{ id: string }>();
  // Straight from the scanner, the scan is already here, so the photo can
  // morph in from the progress screen instead of waiting on a load.
  const [state, setState] = useState<State>(() => {
    const scan = handedOffScan(id);
    return scan ? { kind: "ready", scan } : { kind: "loading" };
  });
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    firstToCheck(handedOffScan(id)),
  );
  const [assembling, setAssembling] = useState(true);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [zoomed, setZoomed] = useState(false);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [undo, setUndo] = useState<DetectionChange[] | null>(null);
  const addPart = useRef<HTMLSelectElement>(null);
  const emptyHeading = useRef<HTMLHeadingElement>(null);
  /** Set when a change removes the last piece, so focus lands on the empty state. */
  const focusEmpty = useRef(false);
  const photoFrame = useRef<HTMLDivElement>(null);
  const piecePanel = useRef<HTMLElement>(null);
  /** The photo frame's width on screen; 0 until measured. */
  const [frameWidth, setFrameWidth] = useState(0);

  useEffect(() => {
    let active = true;
    const handedOff = handedOffScan(id);
    void getScan(id).then((scan) => {
      if (!active) return;
      forgetHandedOffScan(id);
      setState(scan ? { kind: "ready", scan } : { kind: "missing" });
      if (!handedOff) setSelectedId(firstToCheck(scan));
    });
    return () => {
      active = false;
    };
  }, [id]);

  // Once the first run of boxes and tiles has clicked in, later ones (an undo,
  // an added piece) arrive at once instead of waiting their turn.
  const ready = state.kind === "ready";
  useEffect(() => {
    if (!ready) return;
    const run =
      MAX_STAGGER * readDuration("--stagger-step") +
      readDuration("--duration-click");
    // Unreadable tokens (no stylesheet) fall back to about a second.
    const timer = setTimeout(() => setAssembling(false), run || 1000);
    return () => clearTimeout(timer);
  }, [ready]);

  // Labels are thinned to fit the photo as drawn, so follow its width.
  useEffect(() => {
    const frame = photoFrame.current;
    if (!ready || !frame || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) =>
      setFrameWidth(Math.round(entry.contentRect.width)),
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [ready]);

  // Zoomed in, the selected piece may be off to the side: bring it into view.
  useEffect(() => {
    const frame = photoFrame.current;
    const box =
      state.kind === "ready"
        ? state.scan.detections.find((d) => d.id === selectedId)?.box
        : null;
    if (!zoomed || !frame || !box) return;
    const left = box.x * frame.scrollWidth;
    const right = (box.x + box.width) * frame.scrollWidth;
    const view = frame.scrollLeft;
    if (left >= view && right <= view + frame.clientWidth) return;
    frame.scrollTo?.({
      left: (left + right - frame.clientWidth) / 2,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [zoomed, selectedId, state]);

  // The selected piece's controls are gone with it, so focus would drop to the page.
  useEffect(() => {
    if (state.kind !== "ready" || !focusEmpty.current) return;
    focusEmpty.current = false;
    emptyHeading.current?.focus();
  }, [state]);

  if (state.kind === "loading") {
    return <ResultsLoading label={copy.results.loading} />;
  }

  if (state.kind === "missing") {
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

  const { scan } = state;
  const empty = scan.detections.length === 0;
  const selected = scan.detections.find((d) => d.id === selectedId) ?? null;
  const flagged = scan.detections.filter(needsCheck);
  const flaggedKeys = new Set(flagged.map(inventoryKey));
  const editedKeys = new Set(
    scan.detections.filter((d) => d.edited).map(inventoryKey),
  );
  const allBoxes = labeledBoxes(
    scan.detections,
    locale,
    selectedId ?? undefined,
  );
  // The photo is drawn inside a 2.5px border, scaled to its frame. Zooming in
  // goes far enough for the smallest box to be a usable tap target.
  const ratio = scan.photo.height / scan.photo.width;
  const fullWidth = Math.max(frameWidth - 5, 0);
  const zoom = zoomFor(allBoxes, {
    width: fullWidth,
    height: fullWidth * ratio,
  });
  // Without boxes there's nothing to tap, so no zoom (even if it was on).
  const zoomedIn = zoomed && allBoxes.length > 0;
  const drawnWidth = Math.max(frameWidth * (zoomedIn ? zoom : 1) - 5, 0);
  const boxes =
    drawnWidth > 0
      ? fitLabels(allBoxes, {
          width: drawnWidth,
          height: drawnWidth * ratio,
        })
      : allBoxes;
  // Found pieces with nowhere on the photo: the mock's stand-in for a photo it
  // can't see, so say plainly that the results aren't from this photo.
  const demo = countUnplaced(scan.detections) > 0;
  const partTypes = new Set(scan.detections.map((d) => d.part)).size;
  const colors = new Set(scan.detections.map((d) => d.color)).size;

  function select(pieceId: string | null) {
    if (pieceId && pieceId !== selectedId) snapHaptic();
    setSelectedId(pieceId);
  }

  // Selecting a line picks one of its pieces; selecting it again moves to the next.
  function selectLine(line: PartCount) {
    const group = scan.detections.filter(
      (d) => d.part === line.part && d.color === line.color,
    );
    const index = group.findIndex((d) => d.id === selectedId);
    select(group[(index + 1) % group.length]?.id ?? null);
    // Far down a long inventory the piece panel has scrolled away; bring it
    // back so the pick shows, with its controls.
    const panel = piecePanel.current;
    if (panel && panel.getBoundingClientRect().top < 0) {
      panel.scrollIntoView?.({
        block: "start",
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    }
  }

  /** Saves changes, remembers how to undo them, and says what happened. */
  async function apply(
    changes: DetectionChange[],
    message: string,
    {
      select,
      isUndo = false,
      exitMs = 0,
    }: {
      select?: (before: Scan, after: Scan) => string | null;
      isUndo?: boolean;
      /** Keep the old view up at least this long, for an exit animation. */
      exitMs?: number;
    } = {},
  ) {
    setPending(true);
    try {
      const before = scan;
      const [after] = await Promise.all([
        updateDetections(scan.id, changes),
        wait(exitMs),
      ]);
      focusEmpty.current =
        before.detections.length > 0 && after.detections.length === 0;
      setState({ kind: "ready", scan: after });
      setUndo(
        isUndo ? null : inverseChanges(before.detections, after.detections),
      );
      if (select) setSelectedId(select(before, after));
      setStatus(message);
    } catch {
      setStatus(copy.results.status.failed);
    } finally {
      setPending(false);
    }
  }

  function save(part: BrickPartId, color: BrickColorId) {
    if (!selected) return;
    void apply(
      [{ type: "edit", id: selected.id, part, color }],
      copy.results.status.edited,
    );
  }

  function remove() {
    if (!selected) return;
    // The piece pops off while the change saves; if saving fails it stays.
    setLeavingId(selected.id);
    void apply(
      [{ type: "remove", id: selected.id }],
      copy.results.status.removed,
      {
        select: () => null,
        exitMs: readDuration("--duration-exit"),
      },
    ).finally(() => setLeavingId(null));
  }

  function add(part: BrickPartId, color: BrickColorId, quantity: number) {
    void apply(
      [{ type: "add", part, color, quantity }],
      plural(copy.results.status.added, quantity, locale),
      {
        select: (before, after) => {
          const known = new Set(before.detections.map((d) => d.id));
          return after.detections.find((d) => !known.has(d.id))?.id ?? null;
        },
      },
    );
  }

  function undoLast() {
    if (!undo) return;
    snapHaptic();
    void apply(undo, copy.results.status.undone, {
      isUndo: true,
      select: (_, after) =>
        after.detections.some((d) => d.id === selectedId) ? selectedId : null,
    });
  }

  const leaving = scan.detections.find((d) => d.id === leavingId);
  const leavingKey =
    leaving &&
    scan.detections.filter((d) => inventoryKey(d) === inventoryKey(leaving))
      .length === 1
      ? inventoryKey(leaving)
      : undefined;
  const totals = [
    [copy.common.pieces, scan.detections.length],
    [copy.results.totals.parts, partTypes],
    [copy.results.totals.colors, colors],
  ] as const;

  return (
    <div className="grid gap-y-[calc(var(--stud)*2)] lg:grid-cols-12 lg:gap-x-stud">
      {/* On desktop the photo stays in view while the inventory scrolls by. */}
      <section
        aria-labelledby="results-title"
        className="lg:sticky lg:top-stud lg:col-span-8 lg:self-start"
      >
        <div className="click-in flex flex-wrap items-center gap-x-stud gap-y-3 pr-[4.5rem] sm:pr-0">
          <h1
            id="results-title"
            className="font-display text-3xl leading-tight sm:text-5xl"
          >
            <Sticker className="-rotate-2">{copy.results.title}</Sticker>
          </h1>
          <Count
            as="p"
            message={copy.common.pieces}
            count={scan.detections.length}
            locale={locale}
            className="font-mono text-xl font-bold"
          />
          {flagged.length > 0 && (
            <Badge tone="warning">
              {plural(copy.results.toCheck, flagged.length, locale)}
            </Badge>
          )}
        </div>

        {demo && (
          <div
            role="note"
            className="click-in mt-stud max-w-2xl rounded-callout border-2 border-ink bg-card p-3 sm:p-4"
          >
            <Badge tone="warning">{copy.results.demo.label}</Badge>
            <p className="mt-2 text-sm">{copy.results.demo.body}</p>
          </div>
        )}

        {boxes.length > 0 && (
          <div className="mt-stud flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLabels((value) => !value)}
            >
              {showLabels ? copy.results.labels.hide : copy.results.labels.show}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setZoomed((value) => !value)}
            >
              {zoomedIn ? copy.results.zoom.out : copy.results.zoom.in}
            </Button>
          </div>
        )}

        {/* The photo plate. Zoomed photos scroll sideways on phones; boxes
            scale with the photo. On desktop the part callout overlaps the
            plate's right edge, never the photo, and a tall photo narrows so
            all of it stays in view beside the inventory. */}
        <div className="mt-3 rounded-card border-[2.5px] border-ink bg-card p-2 shadow-card sm:p-3 lg:pr-[calc(var(--stud)+0.75rem)]">
          <div
            ref={photoFrame}
            className={cx(
              "overflow-auto rounded-callout lg:mx-auto",
              demo
                ? "lg:max-w-[max(18rem,calc((100svh-22rem)*var(--photo-ratio)))]"
                : "lg:max-w-[max(18rem,calc((100svh-15rem)*var(--photo-ratio)))]",
            )}
            style={
              {
                "--photo-ratio": scan.photo.width / scan.photo.height,
              } as CSSProperties
            }
          >
            <div style={{ width: zoomedIn ? `${zoom * 100}%` : "100%" }}>
              <SharedPhoto>
                <DetectedPhoto
                  photo={scan.photo}
                  alt={
                    boxes.length > 0
                      ? copy.results.photoAlt
                      : copy.results.photoAltPlain
                  }
                  detections={boxes}
                  labels={showLabels ? "auto" : "none"}
                  onSelect={select}
                  assembling={assembling}
                  leavingId={leavingId ?? undefined}
                />
              </SharedPhoto>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-[calc(var(--stud)*1.5)] lg:relative lg:z-10 lg:col-span-4 lg:col-start-9 lg:pt-[calc(var(--stud)*5)]">
        {!empty && (
          <PieceDetail
            ref={piecePanel}
            className="scroll-mt-stud lg:-ml-[calc(var(--stud)*2)]"
            detection={selected}
            locale={locale}
            copy={
              boxes.length > 0
                ? copy.results.piece
                : { ...copy.results.piece, empty: copy.results.piece.emptyList }
            }
          >
            {selected && (
              <EditPiece
                key={selected.id}
                detection={selected}
                locale={locale}
                copy={copy.results.edit}
                pending={pending}
                onSave={save}
                onRemove={remove}
              />
            )}
          </PieceDetail>
        )}

        <section aria-labelledby="inventory-title" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-x-stud gap-y-2">
            <h2 id="inventory-title" className="font-display text-xl">
              <Sticker tone="paper" className="rotate-2">
                {copy.common.inventory}
              </Sticker>
            </h2>
            {!empty && (
              <>
                <p className="sr-only">
                  {totals
                    .map(([message, count]) => plural(message, count, locale))
                    .join(" · ")}
                </p>
                <p
                  aria-hidden="true"
                  className="font-mono text-xs text-ink-secondary"
                >
                  {totals.map(([message, count], index) => (
                    <span key={message.other}>
                      {index > 0 && " · "}
                      <OdometerText
                        message={message}
                        count={count}
                        locale={locale}
                      />
                    </span>
                  ))}
                </p>
              </>
            )}
          </div>
          {empty ? (
            <EmptyState
              as="h3"
              className="click-in"
              headingRef={emptyHeading}
              icon={<EmptyStateIcon />}
              title={copy.results.empty.title}
              body={copy.results.empty.body}
              actions={
                <>
                  <Button
                    variant="secondary"
                    onClick={() => addPart.current?.focus()}
                  >
                    {copy.results.empty.add}
                  </Button>
                  <Link
                    href={`/${locale}/scan`}
                    className={buttonStyles({ variant: "ghost" })}
                  >
                    {copy.results.empty.retake}
                  </Link>
                </>
              }
            />
          ) : (
            <InventoryList
              items={toInventory(scan.detections)}
              locale={locale}
              selectedKey={selected ? inventoryKey(selected) : undefined}
              flaggedKeys={flaggedKeys}
              flaggedLabel={copy.results.piece.check}
              editedKeys={editedKeys}
              editedLabel={copy.results.edit.edited}
              onSelect={selectLine}
              assembling={assembling}
              leavingKey={leavingKey}
            />
          )}
          <div className="flex min-h-10 flex-wrap items-center gap-3">
            <output className="text-sm font-semibold">{status}</output>
            {undo && undo.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={undoLast}
              >
                {copy.results.undo}
              </Button>
            )}
          </div>
          <AddPiece
            partRef={addPart}
            locale={locale}
            copy={copy.results.add}
            pending={pending}
            onAdd={add}
          />
        </section>

        {empty ? (
          // Ideas need pieces to build with, so say what's missing instead of
          // leading to an empty ideas page.
          <div className="space-y-2">
            <Button
              disabled
              aria-describedby="continue-hint"
              className="w-full sm:w-auto"
            >
              {copy.results.continue} <span aria-hidden="true">→</span>
            </Button>
            <p id="continue-hint" className="text-sm text-ink-secondary">
              {copy.results.empty.continueHint}
            </p>
          </div>
        ) : (
          <Link
            href={`/${locale}/scan/${scan.id}/ideas`}
            className={`${buttonStyles()} w-full sm:w-auto`}
          >
            {copy.results.continue} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </div>
  );
}
