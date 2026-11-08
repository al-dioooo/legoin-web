"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LOCALES, type Locale, localizedPath } from "@/i18n/locales";
import { cx } from "@/lib/cx";

type Props = {
  current: Locale;
  label: string;
  names: Record<Locale, string>;
  className?: string;
};

/**
 * EN / ID pill that keeps you on the same page in the other language, with the
 * same query and hash, e.g. the theme on the ideas page.
 */
export function LanguageSwitcher(props: Props) {
  // A prerendered page doesn't know its query until it reaches the browser, so
  // the links start as the bare page and pick up the query once it hydrates.
  return (
    <Suspense fallback={<Pills {...props} />}>
      <PillsWithQuery {...props} />
    </Suspense>
  );
}

function PillsWithQuery(props: Props) {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const hash = useHash(searchParams);
  return <Pills {...props} suffix={`${query ? `?${query}` : ""}${hash}`} />;
}

/**
 * The URL's #fragment. Next gives `searchParams` a new identity on every
 * navigation, hash-only ones included, and has written the new URL by the time
 * effects run; plain `<a href="#…">` links and back/forward fire `hashchange`.
 */
function useHash(searchParams: unknown) {
  const [hash, setHash] = useState("");
  // biome-ignore lint/correctness/useExhaustiveDependencies: searchParams marks a navigation; see above
  useEffect(() => {
    const read = () => setHash(window.location.hash);
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [searchParams]);
  return hash;
}

function Pills({
  current,
  label,
  names,
  className,
  suffix = "",
}: Props & {
  /** Query and hash to keep, e.g. "?theme=animals#idea-2". */
  suffix?: string;
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
          href={`${localizedPath(pathname, locale)}${suffix}`}
          hrefLang={locale}
          lang={locale}
          aria-current={locale === current ? "true" : undefined}
          className={cx(
            "inline-flex min-h-10 min-w-12 items-center justify-center rounded-full px-3 font-mono text-sm font-bold uppercase transition-colors",
            // Outlined, not only yellow, so it still shows in forced colors.
            locale === current
              ? "border-2 border-ink bg-highlight"
              : "hover:bg-highlight-subtle",
          )}
        >
          {/* The code people see starts the name, so saying "ID" works for
              voice control; the language's own name follows. */}
          {locale}
          <span className="sr-only">, {names[locale]}</span>
        </Link>
      ))}
    </nav>
  );
}
