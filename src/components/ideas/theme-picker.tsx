"use client";

import { useId } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { cx } from "@/lib/cx";
import { THEMES, type Theme } from "@/lib/domain";

type Copy = Dictionary["ideas"]["picker"];

/**
 * The theme for build ideas (PRD F7). Native radios, so arrow keys move between
 * themes and screen readers announce the group and position. `cards` is the
 * first, big choice; `compact` sits above the ideas to switch theme in place.
 */
export function ThemePicker({
  copy,
  value,
  onChange,
  variant = "cards",
  disabled = false,
  className,
}: {
  copy: Copy;
  value: Theme;
  onChange: (theme: Theme) => void;
  variant?: "cards" | "compact";
  disabled?: boolean;
  className?: string;
}) {
  const name = useId();
  const cards = variant === "cards";

  return (
    <fieldset disabled={disabled} className={className}>
      <legend
        className={
          cards
            ? "sr-only"
            : "mb-2 font-mono text-xs font-bold tracking-[0.25em] uppercase"
        }
      >
        {copy.legend}
      </legend>
      <div
        className={
          cards ? "grid grid-cols-2 gap-3 sm:gap-4" : "flex flex-wrap gap-2"
        }
      >
        {THEMES.map((theme) => (
          <label
            key={theme}
            className={cx(
              // The input is visually hidden, so the label carries the focus ring.
              "group relative cursor-pointer border-ink bg-card transition-[rotate,background-color] duration-300 ease-spring hover:-rotate-1 has-checked:bg-highlight has-focus-visible:outline-2 has-focus-visible:outline-ring has-focus-visible:outline-offset-3 has-disabled:cursor-default has-disabled:opacity-60",
              cards
                ? "flex min-h-28 flex-col items-start gap-1 rounded-card border-[2.5px] p-4 shadow-sticker"
                : "inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold",
            )}
          >
            <input
              type="radio"
              name={name}
              value={theme}
              checked={value === theme}
              onChange={() => onChange(theme)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className={cx(
                "grid shrink-0 place-items-center rounded-full border-2 border-ink bg-page",
                cards ? "mb-2 size-6" : "size-4",
              )}
            >
              <span
                className={cx(
                  "rounded-full bg-ink opacity-0 group-has-checked:opacity-100",
                  cards ? "size-2.5" : "size-1.5",
                )}
              />
            </span>
            {cards ? (
              <>
                <span className="font-display text-xl sm:text-2xl">
                  {copy.themes[theme].label}
                </span>
                <span className="text-sm">{copy.themes[theme].hint}</span>
              </>
            ) : (
              copy.themes[theme].label
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
