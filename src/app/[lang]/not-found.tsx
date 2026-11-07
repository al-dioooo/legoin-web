import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { StatePage } from "@/components/app/state-page";
import { LanguageSwitcher } from "@/components/language-switcher";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState, EmptyStateIcon } from "@/components/ui/empty-state";
import { currentLocale, getDictionary } from "@/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.states.notFound.title };
}

/**
 * Shown for unknown paths under a language (see `[...rest]`) and wherever a
 * page calls `notFound()`, e.g. for an unknown idea id.
 */
export default async function NotFound() {
  const locale = await currentLocale();
  const dict = await getDictionary();
  const copy = dict.states.notFound;

  return (
    <StatePage
      locale={locale}
      homeLabel={dict.app.home}
      corner={
        // The switcher reads the URL, which isn't known when this is prerendered.
        <Suspense fallback={<div className="h-[3.25rem] w-28" />}>
          <LanguageSwitcher
            current={locale}
            label={dict.language.label}
            names={dict.language.names}
          />
        </Suspense>
      }
    >
      <EmptyState
        as="h1"
        icon={<EmptyStateIcon />}
        title={copy.title}
        body={copy.body}
        actions={
          <>
            <Link href={`/${locale}`} className={buttonStyles()}>
              {copy.home}
            </Link>
            <Link
              href={`/${locale}/scan`}
              className={buttonStyles({ variant: "secondary" })}
            >
              {copy.scan}
            </Link>
          </>
        }
      />
    </StatePage>
  );
}
