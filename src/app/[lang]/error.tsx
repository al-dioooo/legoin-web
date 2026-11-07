"use client";

import { ErrorScreen } from "@/components/app/error-screen";

/**
 * Catches errors thrown while rendering any page under a language, and the
 * layouts below the root one. `retry` fetches and renders the segment again.
 */
export default function ErrorBoundary({ retry }: { retry: () => void }) {
  return <ErrorScreen retry={retry} />;
}
