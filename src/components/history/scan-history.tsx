"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { ScanRow, type ScanRowCopy } from "@/components/history/scan-row";
import { Count } from "@/components/motion/odometer";
import { Button, buttonStyles } from "@/components/ui/button";
import { EmptyState, EmptyStateIcon } from "@/components/ui/empty-state";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/locales";
import { deleteScan, listScans } from "@/lib/api";
import type { Scan } from "@/lib/domain";
import { readDuration, staggerIndex } from "@/lib/motion";

type Copy = ScanRowCopy & { history: Dictionary["history"] };

type State =
  | { kind: "loading" }
  | { kind: "failed" }
  | { kind: "ready"; scans: Scan[] };

/** Where focus goes once a scan is gone: the card that took its place, or the empty state. */
type FocusTarget = { scanId: string } | "empty";

/** The list as a state to show; a failed request becomes "failed". */
const load = (): Promise<State> =>
  listScans().then(
    (scans) => ({ kind: "ready", scans }),
    () => ({ kind: "failed" }),
  );

const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, Math.max(ms, 0)));

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
 * Past scans, newest first (PRD F8). Each card opens its scan, jumps back to
 * its ideas when it has a last theme, and deletes after asking. Cards click
 * in one after another; a deleted card pops off like a removed piece, and
 * focus moves to the card that takes its place.
 */
export function ScanHistory({ copy, locale }: { copy: Copy; locale: Locale }) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [leaving, setLeaving] = useState<ReadonlySet<string>>(new Set());
  const [status, setStatus] = useState("");
  const links = useRef(new Map<string, HTMLAnchorElement>());
  const emptyHeading = useRef<HTMLHeadingElement>(null);
  const focusNext = useRef<FocusTarget | null>(null);

  useEffect(() => {
    let active = true;
    void load().then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
    };
  }, []);

  // After a delete re-renders the list, focus lands where the scan was.
  useEffect(() => {
    const target = focusNext.current;
    if (state.kind !== "ready" || !target) return;
    focusNext.current = null;
    if (target === "empty") emptyHeading.current?.focus();
    else links.current.get(target.scanId)?.focus();
  }, [state]);

  function retry() {
    setState({ kind: "loading" });
    void load().then(setState);
  }

  function markLeaving(ids: string[], on: boolean) {
    setLeaving((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  /** Deletes a scan once confirmed. The card pops off while it saves; if saving fails it stays. */
  async function remove(scan: Scan, scans: Scan[]) {
    const at = scans.findIndex((candidate) => candidate.id === scan.id);
    const neighbour = scans[at + 1] ?? scans[at - 1];
    markLeaving([scan.id], true);
    try {
      await Promise.all([
        deleteScan(scan.id),
        wait(readDuration("--duration-exit")),
      ]);
    } catch {
      setStatus(copy.history.delete.failed);
      return false;
    } finally {
      markLeaving([scan.id], false);
    }
    focusNext.current = neighbour ? { scanId: neighbour.id } : "empty";
    setState((current) =>
      current.kind === "ready"
        ? {
            kind: "ready",
            scans: current.scans.filter(
              (candidate) => candidate.id !== scan.id,
            ),
          }
        : current,
    );
    setStatus(copy.history.delete.done);
    return true;
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
        headingRef={emptyHeading}
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
              className={leaving.has(scan.id) ? "pop-off" : "click-in"}
              style={{ "--i": staggerIndex(index) } as CSSProperties}
            >
              <ScanRow
                scan={scan}
                locale={locale}
                copy={copy}
                onDelete={() => remove(scan, scans)}
                linkRef={(node) => {
                  if (node) links.current.set(scan.id, node);
                  else links.current.delete(scan.id);
                }}
              />
            </li>
          ))}
        </ol>
      </>
    );
  }

  return (
    <>
      {body}
      {/* Always mounted, so a delete is announced even when the list empties. */}
      <output className="mt-stud block min-h-6 text-sm font-semibold">
        {status}
      </output>
    </>
  );
}
