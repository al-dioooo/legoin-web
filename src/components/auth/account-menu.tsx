"use client";

import { useState } from "react";
import { useAccount } from "@/components/auth/use-account";
import { Button } from "@/components/ui/button";
import { fill } from "@/i18n/format";
import { logOut } from "@/lib/api";

/**
 * Who's logged in, and the way out. Logging out forgets the session, so the
 * page's `RequireAccount` takes the person to the log-in.
 */
export function AccountMenu({
  copy,
}: {
  copy: { account: string; logOut: string };
}) {
  const account = useAccount();
  const [pending, setPending] = useState(false);
  if (!account) return null;

  async function leave() {
    setPending(true);
    try {
      await logOut();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-[14rem] truncate text-sm text-ink-secondary lg:inline">
        {fill(copy.account, { email: account.email })}
      </span>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={leave}
        title={fill(copy.account, { email: account.email })}
      >
        {copy.logOut}
      </Button>
    </div>
  );
}
