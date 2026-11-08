"use client";

import "./globals.css";
import type { CSSProperties } from "react";
import {
  ErrorScreen,
  errorCopy,
  useRouteLocale,
} from "@/components/app/error-screen";
import { SkipLink } from "@/components/app/skip-link";

// The font tokens read variables that the root layout's fonts define, and this
// page replaces that layout. Point them at system fonts instead of loading the
// fonts here, which would preload them on every page for a screen that is rare.
const SYSTEM_FONTS = {
  "--font-dela-gothic": "ui-sans-serif, system-ui, sans-serif",
  "--font-dm-sans": "ui-sans-serif, system-ui, sans-serif",
  "--font-jetbrains": "ui-monospace, monospace",
} as CSSProperties;

/**
 * Last resort, for errors in the root layout itself. It replaces the whole
 * document, so it brings its own html, body and styles; metadata exports don't
 * work here, so it sets the title itself. It draws the same baseplate as the
 * root layout, minus the pointer glow, so it depends on as little as possible.
 */
export default function GlobalError({ retry }: { retry: () => void }) {
  const locale = useRouteLocale();
  return (
    <html lang={locale} style={SYSTEM_FONTS} className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-page font-sans text-ink">
        <title>{`${errorCopy(locale).title} · Legoin`}</title>
        <SkipLink label={errorCopy(locale).skip} />
        <div className="baseplate flex flex-1 flex-col overflow-x-clip">
          <ErrorScreen retry={retry} />
        </div>
      </body>
    </html>
  );
}
