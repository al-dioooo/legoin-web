"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useAccount } from "@/components/auth/use-account";
import type { Locale } from "@/i18n/locales";

/**
 * Pages that scan or show scans need a log-in (ADR-0011). Without a session,
 * they go to the log-in, which brings the person back here after. That also
 * happens the moment the data layer forgets the session, as it does when the
 * API answers `401 unauthorized`.
 *
 * Nothing is shown until the browser knows the session, so a page never
 * starts loading scans it can't read.
 */
export function RequireAccount({
  locale,
  checking,
  children,
}: {
  locale: Locale;
  /** Said while there's no session yet, on the way to the log-in. */
  checking: string;
  children: ReactNode;
}) {
  const account = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (account !== null) return;
    const { pathname, search, hash } = window.location;
    router.replace(
      `/${locale}/login?next=${encodeURIComponent(`${pathname}${search}${hash}`)}`,
    );
  }, [account, locale, router]);

  if (account) return children;
  return (
    <output className="sr-only">{account === null ? checking : ""}</output>
  );
}
