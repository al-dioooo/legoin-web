import Link from "next/link";
import { MAIN_ID } from "@/components/app/skip-link";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { currentLocale, getDictionary } from "@/i18n/dictionaries";

/**
 * Shell for logging in and making an account: the logo back home and the
 * language, with no step progress, since nothing is scanned yet.
 */
export default async function AccountLayout({
  children,
}: LayoutProps<"/[lang]">) {
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
        <LanguageSwitcher
          current={locale}
          label={dict.language.label}
          names={dict.language.names}
          className="ml-auto"
        />
      </header>
      <main
        id={MAIN_ID}
        tabIndex={-1}
        className="relative mx-auto w-full max-w-(--plate-width) flex-1 px-stud pt-[calc(var(--stud)*2)] pb-[calc(var(--stud)*3)] outline-none"
      >
        {children}
      </main>
    </>
  );
}
