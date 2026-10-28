"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, type Locale, localizedPath } from "@/i18n/locales";
import { cx } from "@/lib/cx";

/** EN / ID pill that keeps you on the same page in the other language. */
export function LanguageSwitcher({
  current,
  label,
  names,
  className,
}: {
  current: Locale;
  label: string;
  names: Record<Locale, string>;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <nav
      aria-label={label}
      className={cx(
        "inline-flex rounded-full border-[2.5px] border-ink bg-page p-1 shadow-sticker",
        className,
      )}
    >
      {LOCALES.map((locale) => (
        <Link
          key={locale}
          href={localizedPath(pathname, locale)}
          hrefLang={locale}
          lang={locale}
          aria-current={locale === current ? "true" : undefined}
          className={cx(
            "inline-flex min-h-10 min-w-12 items-center justify-center rounded-full px-3 font-mono text-sm font-bold uppercase transition-colors",
            locale === current ? "bg-highlight" : "hover:bg-highlight-subtle",
          )}
        >
          <span aria-hidden="true">{locale}</span>
          <span className="sr-only">{names[locale]}</span>
        </Link>
      ))}
    </nav>
  );
}
