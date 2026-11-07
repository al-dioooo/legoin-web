"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { StatePage } from "@/components/app/state-page";
import { Button, buttonStyles } from "@/components/ui/button";
import { EmptyState, EmptyStateIcon } from "@/components/ui/empty-state";
import { en } from "@/i18n/dictionaries/en";
import { id } from "@/i18n/dictionaries/id";
import { DEFAULT_LOCALE, hasLocale, type Locale } from "@/i18n/locales";

// Error boundaries are Client Components that get no props from the server, so
// unlike pages they read their copy straight from the dictionaries.
const COPY = {
  en: { homeLabel: en.app.home, ...en.states.error },
  id: { homeLabel: id.app.home, ...id.states.error },
} satisfies Record<Locale, unknown>;

/** The language in the URL; English when there is none to read. */
export function useRouteLocale(): Locale {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang;
  return lang && hasLocale(lang) ? lang : DEFAULT_LOCALE;
}

export function errorCopy(locale: Locale) {
  return COPY[locale];
}

/** What the error boundaries show: a short apology, a retry and a way home. */
export function ErrorScreen({ retry }: { retry: () => void }) {
  const locale = useRouteLocale();
  const copy = COPY[locale];
  const heading = useRef<HTMLHeadingElement>(null);
  // The error replaced what the user was on; announce it from the top.
  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <StatePage locale={locale} homeLabel={copy.homeLabel}>
      <EmptyState
        as="h1"
        tone="danger"
        icon={<EmptyStateIcon variant="error" />}
        title={copy.title}
        body={copy.body}
        headingRef={heading}
        actions={
          <>
            <Button onClick={retry}>{copy.retry}</Button>
            {/* A full load, so a broken page's client state doesn't follow you home. */}
            <a
              href={`/${locale}`}
              className={buttonStyles({ variant: "secondary" })}
            >
              {copy.home}
            </a>
          </>
        }
      />
    </StatePage>
  );
}
