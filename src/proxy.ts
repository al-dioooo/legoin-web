import { type NextRequest, NextResponse } from "next/server";
import { defaultLocaleRedirect } from "@/i18n/locales";

/** Every page lives under a language; requests without one go to English. */
export function proxy(request: NextRequest) {
  const target = defaultLocaleRedirect(request.nextUrl.pathname);
  if (!target) return;
  const url = request.nextUrl.clone();
  url.pathname = target;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals and files such as /icon.svg and /contoh/kepingan.jpg.
  matcher: ["/((?!_next|.*\\..*).*)"],
};
