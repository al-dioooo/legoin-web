"use client";

import { type FormEvent, useState } from "react";
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

type Copy = Dictionary["results"]["add"];

export const MAX_ADD_QUANTITY = 20;

/** Adds pieces the detector missed, by part, color and quantity (PRD F5). */
export function AddPiece({
  locale,
  copy,
  pending,
  onAdd,
}: {
  locale: Locale;
  copy: Copy;
  pending: boolean;
  onAdd: (part: BrickPartId, color: BrickColorId, quantity: number) => void;
}) {
  const [part, setPart] = useState<BrickPartId>("brick-2x4");
  const [color, setColor] = useState<BrickColorId>("red");
  const [quantity, setQuantity] = useState("1");
  const [invalid, setInvalid] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    const count = Number(quantity);
    if (!Number.isInteger(count) || count < 1 || count > MAX_ADD_QUANTITY) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    onAdd(part, color, count);
    setQuantity("1");
  }

  return (
    // noValidate: our own message, in the page's language, instead of the browser's.
    <form
      noValidate
      onSubmit={submit}
      aria-labelledby="add-title"
      className="rounded-card border-2 border-dashed border-ink bg-page p-4"
    >
      <h3 id="add-title" className="font-display text-lg">
        {copy.title}
      </h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_6rem] lg:grid-cols-1 xl:grid-cols-[1fr_1fr_6rem]">
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
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink">
          {copy.quantity}
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_ADD_QUANTITY}
            value={quantity}
            disabled={pending}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? "add-error" : undefined}
            onChange={(event) => setQuantity(event.target.value)}
            className="min-h-12 w-full rounded-control border-[2.5px] border-ink bg-card px-4 text-base font-medium"
          />
        </label>
      </div>
      {invalid && (
        <p
          id="add-error"
          role="alert"
          className="mt-2 text-sm font-semibold text-danger"
        >
          {copy.invalid}
        </p>
      )}
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        disabled={pending}
        className="mt-3"
      >
        {copy.submit}
      </Button>
    </form>
  );
}
