"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import { DetectedPhoto } from "@/components/ui/detected-photo";
import { InventoryList } from "@/components/ui/inventory-list";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { plural } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { labeledBoxes } from "@/lib/detection-labels";
import type { Scan } from "@/lib/domain";
import { toInventory } from "@/lib/inventory";
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

/**
 * A finished scan, read-only: the photo with its boxes and the inventory.
 * #15 adds selection and confidence flags, #16 corrections.
 */
export function ScanSummary({ copy, locale }: { copy: Copy; locale: Locale }) {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    void getScan(id, { delayMs: 150 }).then((scan) => {
      if (active)
        setState(scan ? { kind: "ready", scan } : { kind: "missing" });
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
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
      <section aria-labelledby="results-title">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 id="results-title" className="font-display text-4xl">
            {copy.results.title}
          </h1>
          <p className="font-mono text-sm font-bold">
            {plural(copy.common.pieces, scan.detections.length, locale)}
          </p>
        </div>
        <DetectedPhoto
          photo={scan.photo}
          alt={copy.results.photoAlt}
          detections={labeledBoxes(scan.detections, locale)}
          className="mt-4"
        />
      </section>
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
          className="mt-3"
        />
      </section>
    </div>
  );
}
