"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/locales";
import {
  BRICK_COLORS,
  BRICK_PARTS,
  type BrickColorId,
  type BrickPartId,
  colorLabel,
} from "@/lib/bricks";
import type { Detection } from "@/lib/domain";

type Copy = Dictionary["results"]["edit"];

/**
 * Change a piece's part or color, or remove it after confirming (PRD F5).
 * Key it by the piece's id so the fields reset when another piece is selected.
 */
export function EditPiece({
  detection,
  locale,
  copy,
  pending,
  onSave,
  onRemove,
}: {
  detection: Detection;
  locale: Locale;
  copy: Copy;
  pending: boolean;
  onSave: (part: BrickPartId, color: BrickColorId) => void;
  onRemove: () => void;
}) {
  const [part, setPart] = useState(detection.part);
  const [color, setColor] = useState(detection.color);
  const [confirming, setConfirming] = useState(false);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const removeButton = useRef<HTMLButtonElement>(null);
  const changed = part !== detection.part || color !== detection.color;

  // Move focus into the confirmation and back out of it.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    (confirming ? confirmButton : removeButton).current?.focus();
  }, [confirming]);

  return (
    <div className="mt-4 border-t-2 border-dashed border-line pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-display text-lg">{copy.title}</h3>
        {detection.edited && <Badge>{copy.edited}</Badge>}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Select
          label={copy.part}
          value={part}
          disabled={pending}
          onChange={(event) => setPart(event.target.value as BrickPartId)}
        >
          {(Object.keys(BRICK_PARTS) as BrickPartId[]).map((id) => (
            <option key={id} value={id}>
              {BRICK_PARTS[id].label}
            </option>
          ))}
        </Select>
        <Select
          label={copy.color}
          value={color}
          disabled={pending}
          onChange={(event) => setColor(event.target.value as BrickColorId)}
        >
          {(Object.keys(BRICK_COLORS) as BrickColorId[]).map((id) => (
            <option key={id} value={id}>
              {colorLabel(id, locale)}
            </option>
          ))}
        </Select>
      </div>

      {confirming ? (
        <div className="mt-3 rounded-callout border-2 border-danger bg-danger-subtle p-3">
          <p className="text-sm font-semibold">{copy.confirm}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              ref={confirmButton}
              variant="danger"
              size="sm"
              disabled={pending}
              onClick={onRemove}
            >
              {copy.confirmRemove}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirming(false)}
            >
              {copy.keep}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="highlight"
            size="sm"
            disabled={!changed || pending}
            onClick={() => onSave(part, color)}
          >
            {copy.save}
          </Button>
          <Button
            ref={removeButton}
            variant="danger"
            size="sm"
            disabled={pending}
            onClick={() => setConfirming(true)}
          >
            {copy.remove}
          </Button>
        </div>
      )}
    </div>
  );
}
