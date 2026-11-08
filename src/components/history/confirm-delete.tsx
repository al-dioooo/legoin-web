"use client";

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cx } from "@/lib/cx";

type Copy = {
  /** The danger button, e.g. "Delete". */
  action: string;
  /** Asked in place of the button, e.g. "Delete this scan?". */
  question: string;
  confirm: string;
  keep: string;
};

/**
 * A danger-outlined button that asks before it deletes. The question takes the
 * button's place as a group named by it (a fieldset and its legend), and focus
 * moves to "Keep it", so an extra Enter never deletes anything. "Keep it" or
 * Escape puts the button back and focus on it.
 *
 * `onConfirm` resolves true once deleted: the caller then removes this and
 * moves focus on. It resolves false when deleting failed, and the button comes
 * back to try again.
 */
export function ConfirmDelete({
  copy,
  context,
  onConfirm,
  className,
}: {
  copy: Copy;
  /** Read after each button's label to say what it deletes, e.g. the scan's date. */
  context?: string;
  onConfirm: () => Promise<boolean>;
  className?: string;
}) {
  const [asking, setAsking] = useState(false);
  const [pending, setPending] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const keep = useRef<HTMLButtonElement>(null);

  // Move focus into the question and back out of it.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    (asking ? keep : trigger).current?.focus();
  }, [asking]);

  const suffix = context ? <span className="sr-only">, {context}</span> : null;

  async function confirm() {
    if (pending) return;
    setPending(true);
    const deleted = await onConfirm();
    setPending(false);
    if (!deleted) setAsking(false);
  }

  function cancel() {
    if (!pending) setAsking(false);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    cancel();
  }

  if (!asking) {
    return (
      <Button
        ref={trigger}
        variant="danger"
        size="sm"
        className={className}
        onClick={() => setAsking(true)}
      >
        {copy.action}
        {suffix}
      </Button>
    );
  }

  // A fieldset groups the answers under the question, which is its name.
  return (
    <div
      className={cx(
        "rounded-callout border-2 border-danger bg-danger-subtle p-3",
        className,
      )}
    >
      <fieldset onKeyDown={onKeyDown} className="min-w-0">
        <legend className="text-sm font-semibold">{copy.question}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            variant="danger"
            size="sm"
            aria-disabled={pending}
            onClick={confirm}
            className="aria-disabled:opacity-50"
          >
            {copy.confirm}
            {suffix}
          </Button>
          <Button
            ref={keep}
            variant="secondary"
            size="sm"
            aria-disabled={pending}
            onClick={cancel}
            className="aria-disabled:opacity-50"
          >
            {copy.keep}
          </Button>
        </div>
      </fieldset>
    </div>
  );
}
