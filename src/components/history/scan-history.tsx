"use client";

import Link from "next/link";
import { type CSSProperties, type ReactNode, useEffect, useState } from "react";
import { ScanRow, type ScanRowCopy } from "@/components/history/scan-row";
import { Count } from "@/components/motion/odometer";
import { Button, buttonStyles } from "@/components/ui/button";
import { EmptyState, EmptyStateIcon } from "@/components/ui/empty-state";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/locales";
import { listScans } from "@/lib/api";
import type { Scan } from "@/lib/domain";
import { staggerIndex } from "@/lib/motion";

type Copy = ScanRowCopy & { history: Dictionary["history"] };

type State =
  | { kind: "loading" }
  | { kind: "failed" }
  | { kind: "ready"; scans: Scan[] };

/** The list as a state to show; a failed request becomes "failed". */
const load = (): Promise<State> =>
  listScans().then(
    (scans) => ({ kind: "ready", scans }),
    () => ({ kind: "failed" }),
  );

export function HistoryLoading({ label }: { label: string }) {
  return (
    <div className="mt-[calc(var(--stud)*1.5)] space-y-4" aria-busy="true">
      <p className="text-ink-secondary">{label}</p>
      <div className="grid gap-stud lg:grid-cols-2">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-card border-2 border-line bg-callout motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Past scans, newest first (PRD F8). Each card opens its scan and jumps back
 * to its ideas when it has a last theme. Cards click in one after another.
 */
export function ScanHistory({ copy, locale }: { copy: Copy; locale: Locale }) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    void load().then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
    };
  }, []);

  function retry() {
    setState({ kind: "loading" });
    void load().then(setState);
  }

  let body: ReactNode;
  if (state.kind === "loading") {
    body = <HistoryLoading label={copy.history.loading} />;
  } else if (state.kind === "failed") {
    body = (
      <EmptyState
        className="mt-[calc(var(--stud)*1.5)]"
        tone="danger"
        icon={<EmptyStateIcon variant="error" />}
        title={copy.history.failed.title}
        body={copy.history.failed.body}
        actions={<Button onClick={retry}>{copy.history.failed.retry}</Button>}
      />
    );
  } else if (state.scans.length === 0) {
    body = (
      <EmptyState
        className="click-in mt-[calc(var(--stud)*1.5)]"
        icon={<EmptyStateIcon />}
        title={copy.history.empty.title}
        body={copy.history.empty.body}
        actions={
          <Link href={`/${locale}/scan`} className={buttonStyles()}>
            {copy.history.empty.action}
          </Link>
        }
      />
    );
  } else {
    const { scans } = state;
    body = (
      <>
        <div className="mt-[calc(var(--stud)*1.5)] flex flex-wrap items-center justify-between gap-x-stud gap-y-3">
          <Count
            as="p"
            message={copy.history.count}
            count={scans.length}
            locale={locale}
            className="font-mono text-xl font-bold"
          />
          <Link href={`/${locale}/scan`} className={buttonStyles()}>
            {copy.history.newScan}
          </Link>
        </div>
        <ol className="mt-stud grid gap-stud lg:grid-cols-2">
          {scans.map((scan, index) => (
            <li
              key={scan.id}
              className="click-in"
              style={{ "--i": staggerIndex(index) } as CSSProperties}
            >
              <ScanRow scan={scan} locale={locale} copy={copy} />
            </li>
          ))}
        </ol>
      </>
    );
  }

  return body;
}
