"use client";

import { useSyncExternalStore } from "react";
import { currentAccount, subscribeToAccount } from "@/lib/api";
import type { Account } from "@/lib/domain";

/**
 * The logged-in account, kept by the data layer: null when there's none, and
 * undefined until the page is in the browser, since the session lives in
 * localStorage and the server can't know it.
 */
export function useAccount(): Account | null | undefined {
  return useSyncExternalStore(
    subscribeToAccount,
    currentAccount,
    () => undefined,
  );
}
