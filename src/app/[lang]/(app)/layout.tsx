import Link from "next/link";
import { Suspense } from "react";
import { StepNumeral } from "@/components/app/step-numeral";
import { StepProgress } from "@/components/app/step-progress";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { buttonStyles } from "@/components/ui/button";
import { currentLocale, getDictionary } from "@/i18n/dictionaries";

/**
 * Shell for the scan flow and history: the logo, step progress, history and
 * language on top, and the step numeral behind the page. The baseplate under
 * it all comes from the root layout.
 */
export default async function AppLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await currentLocale();
  const dict = await getDictionary();

  return (
    <>
      <header className="mx-auto flex w-full max-w-(--plate-width) flex-wrap items-center gap-3 px-stud pt-stud">
        <Link
          href={`/${locale}`}
          aria-label={dict.app.home}
          className="inline-flex rounded-full border-[2.5px] border-ink bg-page px-4 py-2 shadow-sticker transition-transform duration-300 ease-spring hover:-rotate-3"
        >
          <Logo />
        </Link>
        {/* Both read the URL. On routes with ids unknown at build time, such as
            /scan/[id], that has to stream in; placeholders keep the header still. */}
        <Suspense
          fallback={
            <div className="order-last h-[3.25rem] w-full md:order-none md:w-auto md:flex-1" />
          }
        >
          <StepProgress
            labels={dict.app.steps}
            className="order-last w-full overflow-x-auto pb-1 md:order-none md:flex md:w-auto md:flex-1 md:justify-center"
          />
        </Suspense>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href={`/${locale}/history`}
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            {dict.app.history}
          </Link>
          <Suspense fallback={<div className="h-[3.25rem] w-28" />}>
            <LanguageSwitcher
              current={locale}
              label={dict.language.label}
              names={dict.language.names}
            />
          </Suspense>
        </div>
      </header>
      <main className="relative mx-auto w-full max-w-(--plate-width) flex-1 px-stud pt-[calc(var(--stud)*2)] pb-[calc(var(--stud)*3)]">
        <Suspense>
          <StepNumeral />
        </Suspense>
        {children}
      </main>
    </>
  );
}
