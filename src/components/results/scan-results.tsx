"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AddPiece } from "@/components/results/add-piece";
import { EditPiece } from "@/components/results/edit-piece";
import { PieceDetail } from "@/components/results/piece-detail";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { DetectedPhoto } from "@/components/ui/detected-photo";
import { InventoryList } from "@/components/ui/inventory-list";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { plural } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import type { BrickColorId, BrickPartId, PartCount } from "@/lib/bricks";
import { labeledBoxes } from "@/lib/detection-labels";
import { type DetectionChange, needsCheck, type Scan } from "@/lib/domain";
import { inventoryKey, inverseChanges, toInventory } from "@/lib/inventory";
import { getScan, updateDetections } from "@/lib/mock/api";

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

/**
 * A finished scan (PRD F2–F5): the photo with selectable boxes, the inventory,
 * and the selected piece, which can be corrected or removed. Missed pieces can
 * be added, and the last change undone. Changes are saved as they're made.
 */
export function ScanResults({ copy, locale }: { copy: Copy; locale: Locale }) {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [zoomed, setZoomed] = useState(false);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [undo, setUndo] = useState<DetectionChange[] | null>(null);

  useEffect(() => {
    let active = true;
    void getScan(id, { delayMs: 150 }).then((scan) => {
      if (!active) return;
      setState(scan ? { kind: "ready", scan } : { kind: "missing" });
      // Start on the first piece to check, so the flag is seen.
      const firstFlagged = scan?.detections.find(needsCheck);
      setSelectedId(firstFlagged?.id ?? null);
    });
    return () => {
      active = false;
    };
  }, [id]);

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
  const selected = scan.detections.find((d) => d.id === selectedId) ?? null;
  const flagged = scan.detections.filter(needsCheck);
  const flaggedKeys = new Set(flagged.map(inventoryKey));
  const editedKeys = new Set(
    scan.detections.filter((d) => d.edited).map(inventoryKey),
  );
  const partTypes = new Set(scan.detections.map((d) => d.part)).size;
  const colors = new Set(scan.detections.map((d) => d.color)).size;

  // Selecting a line picks one of its pieces; selecting it again moves to the next.
  function selectLine(line: PartCount) {
    const group = scan.detections.filter(
      (d) => d.part === line.part && d.color === line.color,
    );
    const index = group.findIndex((d) => d.id === selectedId);
    setSelectedId(group[(index + 1) % group.length]?.id ?? null);
  }

  /** Saves changes, remembers how to undo them, and says what happened. */
  async function apply(
    changes: DetectionChange[],
    message: string,
    {
      select,
      isUndo = false,
    }: {
      select?: (before: Scan, after: Scan) => string | null;
      isUndo?: boolean;
    } = {},
  ) {
    setPending(true);
    try {
      const before = scan;
      const after = await updateDetections(scan.id, changes, { delayMs: 150 });
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
    void apply(
      [{ type: "remove", id: selected.id }],
      copy.results.status.removed,
      {
        select: () => null,
      },
    );
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
    void apply(undo, copy.results.status.undone, {
      isUndo: true,
      select: (_, after) =>
        after.detections.some((d) => d.id === selectedId) ? selectedId : null,
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
      <section aria-labelledby="results-title">
        <div className="flex flex-wrap items-center gap-3">
          <h1 id="results-title" className="mr-auto font-display text-4xl">
            {copy.results.title}
          </h1>
          <p className="font-mono text-sm font-bold">
            {plural(copy.common.pieces, scan.detections.length, locale)}
          </p>
          {flagged.length > 0 && (
            <Badge tone="warning">
              {plural(copy.results.toCheck, flagged.length, locale)}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
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
            {zoomed ? copy.results.zoom.out : copy.results.zoom.in}
          </Button>
        </div>

        {/* Zoomed photos scroll sideways on phones; boxes scale with the photo. */}
        <div className="mt-3 overflow-auto rounded-callout">
          <div style={{ width: zoomed ? "200%" : "100%" }}>
            <DetectedPhoto
              photo={scan.photo}
              alt={copy.results.photoAlt}
              detections={labeledBoxes(
                scan.detections,
                locale,
                selectedId ?? undefined,
              )}
              labels={showLabels ? "auto" : "none"}
              onSelect={setSelectedId}
            />
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <PieceDetail
          detection={selected}
          locale={locale}
          copy={copy.results.piece}
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

        <section aria-labelledby="inventory-title" className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="inventory-title"
              className="font-mono text-xs font-bold tracking-[0.25em] uppercase"
            >
              {copy.common.inventory}
            </h2>
            <p className="font-mono text-xs text-ink-secondary">
              {[
                plural(copy.common.pieces, scan.detections.length, locale),
                plural(copy.results.totals.parts, partTypes, locale),
                plural(copy.results.totals.colors, colors, locale),
              ].join(" · ")}
            </p>
          </div>
          <InventoryList
            items={toInventory(scan.detections)}
            locale={locale}
            selectedKey={selected ? inventoryKey(selected) : undefined}
            flaggedKeys={flaggedKeys}
            flaggedLabel={copy.results.piece.check}
            editedKeys={editedKeys}
            editedLabel={copy.results.edit.edited}
            onSelect={selectLine}
          />
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
            locale={locale}
            copy={copy.results.add}
            pending={pending}
            onAdd={add}
          />
        </section>

        <Link
          href={`/${locale}/scan/${scan.id}/ideas`}
          className={`${buttonStyles()} w-full sm:w-auto`}
        >
          {copy.results.continue} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
