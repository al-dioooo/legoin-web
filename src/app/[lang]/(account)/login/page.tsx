import type { Metadata } from "next";
import { AccountForm } from "@/components/auth/account-form";
import { Sticker } from "@/components/ui/sticker";
import { currentLocale, getDictionary } from "@/i18n/dictionaries";
import { languageAlternates } from "@/i18n/locales";

export async function generateMetadata(): Promise<Metadata> {
  const { auth } = await getDictionary();
  return {
    title: auth.login.title,
    alternates: languageAlternates("/login"),
  };
}

/**
 * Logging in (ADR-0011): every page that scans or shows scans needs it. A static shell: the session lives in the
 * browser, so the form works there, and `?next=` says which page to open after.
 */
export default async function LoginPage() {
  const locale = await currentLocale();
  const { auth } = await getDictionary();
  return (
    <section aria-labelledby="account-title" className="mx-auto max-w-md">
      <div className="click-in">
        <h1
          id="account-title"
          className="font-display text-3xl leading-tight sm:text-5xl"
        >
          <Sticker className="-rotate-2">{auth.login.title}</Sticker>
        </h1>
        <p className="mt-stud text-lg text-ink-secondary">{auth.login.lead}</p>
      </div>
      <AccountForm mode="login" copy={auth} locale={locale} />
    </section>
  );
}
