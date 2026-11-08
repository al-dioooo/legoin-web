import type { ReactNode } from "react";
import { MAIN_ID } from "@/components/app/skip-link";
import { Logo } from "@/components/brand/logo";
import type { Locale } from "@/i18n/locales";

/**
 * Frame for app-level states such as not-found and errors, which replace the
 * page and its shell: the logo back home, an optional corner slot, one state.
 */
export function StatePage({
  locale,
  homeLabel,
  corner,
  children,
}: {
  locale: Locale;
  /** Accessible name of the logo link, e.g. "Legoin home". */
  homeLabel: string;
  /** Top-right slot, e.g. the language switcher. */
  corner?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 pt-6 sm:px-6">
        {/* A full page load, so a broken page's client state doesn't follow you home. */}
        <a
          href={`/${locale}`}
          aria-label={homeLabel}
          className="inline-flex rounded-full border-[2.5px] border-ink bg-page px-4 py-2 shadow-sticker transition-transform duration-300 ease-spring hover:-rotate-3"
        >
          <Logo />
        </a>
        {corner && <div className="ml-auto">{corner}</div>}
      </header>
      <main
        id={MAIN_ID}
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-16 outline-none"
      >
        {children}
      </main>
    </div>
  );
}
