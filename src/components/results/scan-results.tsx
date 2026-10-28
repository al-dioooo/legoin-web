"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PieceDetail } from "@/components/results/piece-detail";
import { Badge } from "@/components/ui/badge";
import { Button, buttonStyles } from "@/components/ui/button";
import { DetectedPhoto } from "@/components/ui/detected-photo";
import { InventoryList } from "@/components/ui/inventory-list";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { plural } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import type { PartCount } from "@/lib/bricks";
import { labeledBoxes } from "@/lib/detection-labels";
import { LOW_CONFIDENCE, type Scan } from "@/lib/domain";
import { inventoryKey, toInventory } from "@/lib/inventory";
import { getScan } from "@/lib/mock/api";

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

const isFlagged = (confidence: number | null) =>
  confidence !== null && confidence < LOW_CONFIDENCE;

/**
 * A finished scan (PRD F2–F4): the photo with selectable boxes, the inventory,
 * and the selected piece. Selecting on either side highlights the other.
 */
export function ScanResults({ copy, locale }: { copy: Copy; locale: Locale }) {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    let active = true;
    void getScan(id, { delayMs: 150 }).then((scan) => {
      if (!active) return;
      setState(scan ? { kind: "ready", scan } : { kind: "missing" });
      // Start on the first piece to check, so the flag is seen.
      const firstFlagged = scan?.detections.find((d) =>
        isFlagged(d.confidence),
      );
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
  const flagged = scan.detections.filter((d) => isFlagged(d.confidence));
  const flaggedKeys = new Set(flagged.map(inventoryKey));

  // Selecting a line picks one of its pieces; selecting it again moves to the next.
  function selectLine(line: PartCount) {
    const group = scan.detections.filter(
      (d) => d.part === line.part && d.color === line.color,
    );
    const index = group.findIndex((d) => d.id === selectedId);
    setSelectedId(group[(index + 1) % group.length]?.id ?? null);
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
        />
        <section aria-labelledby="inventory-title">
          <h2
            id="inventory-title"
            className="font-mono text-xs font-bold tracking-[0.25em] uppercase"
          >
            {copy.common.inventory}
          </h2>
          <InventoryList
            items={toInventory(scan.detections)}
            locale={locale}
            selectedKey={selected ? inventoryKey(selected) : undefined}
            flaggedKeys={flaggedKeys}
            flaggedLabel={copy.results.piece.check}
            onSelect={selectLine}
            className="mt-3"
          />
        </section>
      </div>
    </div>
  );
}
