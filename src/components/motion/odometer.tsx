import type { CSSProperties, ElementType } from "react";
import { type Plural, plural, pluralParts } from "@/i18n/format";
import type { Locale } from "@/i18n/locales";
import { cx } from "@/lib/cx";
import { digitsOf } from "@/lib/motion";

/**
 * A count drawn as digit wheels that roll up from 0 when they appear and roll
 * to the new value when it changes. Visual only: screen readers get the number
 * from text nearby, as `Count` does.
 */
export function Odometer({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const digits = digitsOf(value);
  return (
    <span aria-hidden="true" className={cx("odometer", className)}>
      {digits.map((digit, index) => {
        // Keyed by place, so the ones wheel keeps turning when 9 becomes 10.
        const place = digits.length - 1 - index;
        return (
          <span
            key={place}
            className="odometer-digit"
            style={{ "--d": digit } as CSSProperties}
          >
            <span>{digit}</span>
          </span>
        );
      })}
    </span>
  );
}

/** "8 pieces" with the 8 on an odometer. Hidden from screen readers; see `Count`. */
export function OdometerText({
  message,
  count,
  locale,
}: {
  message: Plural;
  count: number;
  locale: Locale;
}) {
  const parts = pluralParts(message, count, locale);
  if (!parts) return plural(message, count, locale);
  return (
    <>
      {parts[0]}
      <Odometer value={count} />
      {parts[1]}
    </>
  );
}

/**
 * A count in words, such as "8 pieces", whose number ticks like an odometer.
 * Screen readers and text search get the plain sentence from `as`.
 */
export function Count({
  message,
  count,
  locale,
  as: Tag = "span",
  className,
}: {
  message: Plural;
  count: number;
  locale: Locale;
  /** Element for the plain sentence, e.g. "p". */
  as?: ElementType;
  className?: string;
}) {
  return (
    <>
      <Tag className="sr-only">{plural(message, count, locale)}</Tag>
      <span aria-hidden="true" className={className}>
        <OdometerText message={message} count={count} locale={locale} />
      </span>
    </>
  );
}
