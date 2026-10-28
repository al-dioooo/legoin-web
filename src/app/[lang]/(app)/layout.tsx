import Link from "next/link";
import { StepProgress } from "@/components/app/step-progress";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { buttonStyles } from "@/components/ui/button";
import { currentLocale, getDictionary } from "@/i18n/dictionaries";

/** Shell for the scan flow and history: logo, step progress, history and language. */
export default async function AppLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await currentLocale();
  const dict = await getDictionary();

  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 pt-6 sm:px-6">
        <Link
          href={`/${locale}`}
          aria-label={dict.app.home}
          className="inline-flex rounded-full border-[2.5px] border-ink bg-page px-4 py-2 shadow-sticker transition-transform duration-300 ease-spring hover:-rotate-3"
        >
          <Logo />
        </Link>
        <StepProgress
          labels={dict.app.steps}
          className="order-last w-full overflow-x-auto pb-1 md:order-none md:flex md:w-auto md:flex-1 md:justify-center"
        />
        <div className="ml-auto flex items-center gap-2">
          <Link
            href={`/${locale}/history`}
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            {dict.app.history}
          </Link>
          <LanguageSwitcher
            current={locale}
            label={dict.language.label}
            names={dict.language.names}
          />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  );
}
