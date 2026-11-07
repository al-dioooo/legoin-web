import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  ApartDemo,
  ClickInDemo,
  CountDemo,
  MotionShowcase,
  PickDemo,
  PressDemo,
  ScannerDemo,
  TokenTable,
} from "@/components/motion/demos";
import { buttonStyles } from "@/components/ui/button";
import { Sticker } from "@/components/ui/sticker";
import { currentLocale, getDictionary } from "@/i18n/dictionaries";
import { cx } from "@/lib/cx";

export async function generateMetadata(): Promise<Metadata> {
  const { motion } = await getDictionary();
  return { title: `${motion.title.before}${motion.title.sticker}` };
}

/**
 * One idea per section, booklet style: a tilted sticker heading and the rule
 * on the left, the live demo on a plate to the right.
 */
function Section({
  id,
  title,
  description,
  tilt,
  bare = false,
  children,
}: {
  id: string;
  title: string;
  description: string;
  tilt: "left" | "right";
  /** No plate under the demo, so the baseplate shows through. */
  bare?: boolean;
  children?: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="grid gap-stud py-[calc(var(--stud)*2)] lg:grid-cols-12"
    >
      <div className={children ? "lg:col-span-4" : "lg:col-span-8"}>
        <h2 id={`${id}-title`} className="font-display text-2xl sm:text-3xl">
          <Sticker
            tone="paper"
            className={tilt === "left" ? "-rotate-2" : "rotate-2"}
          >
            {title}
          </Sticker>
        </h2>
        <p className="mt-stud max-w-prose text-ink-secondary">{description}</p>
      </div>
      {children && (
        <div
          className={cx(
            "min-w-0 rounded-card border-[2.5px] border-ink p-stud lg:col-span-8",
            bare ? "border-dashed" : "bg-page shadow-card",
          )}
        >
          {children}
        </div>
      )}
    </section>
  );
}

/** /desain/gerak: the motion and interaction language, live. */
export default async function MotionPage() {
  const locale = await currentLocale();
  const dict = await getDictionary();
  const { motion, common, sample } = dict;

  return (
    <MotionShowcase reduceLabel={motion.reduce}>
      <header className="mx-auto flex w-full max-w-(--plate-width) flex-wrap items-center gap-3 px-stud pt-stud">
        <Link
          href={`/${locale}`}
          className="inline-flex rounded-full border-[2.5px] border-ink bg-page px-4 py-2 shadow-sticker transition-transform duration-300 ease-spring hover:-rotate-3"
        >
          <Logo />
        </Link>
        <Link
          href={`/${locale}/desain`}
          className={buttonStyles({ variant: "ghost", size: "sm" })}
        >
          <span aria-hidden="true">←</span> {motion.back}
        </Link>
        <LanguageSwitcher
          current={locale}
          label={dict.language.label}
          names={dict.language.names}
          className="ml-auto"
        />
      </header>

      <main className="relative mx-auto w-full max-w-(--plate-width) px-stud pb-[calc(var(--stud)*4)]">
        <div className="assemble pt-[calc(var(--stud)*3)] pb-stud">
          <h1 className="font-display text-display">
            {motion.title.before}
            <Sticker className="-rotate-2">{motion.title.sticker}</Sticker>
          </h1>
          <p className="mt-stud max-w-2xl text-lg text-ink-secondary">
            {motion.intro}
          </p>
        </div>

        <Section
          id="click-in"
          title={motion.clickIn.title}
          description={motion.clickIn.description}
          tilt="left"
        >
          <ClickInDemo replay={motion.replay} />
        </Section>

        <Section
          id="tokens"
          title={motion.tokens.title}
          description={motion.tokens.description}
          tilt="right"
        >
          <TokenTable name={motion.tokens.name} value={motion.tokens.value} />
        </Section>

        <Section
          id="press"
          title={motion.press.title}
          description={motion.press.description}
          tilt="left"
        >
          <PressDemo
            magnetic={motion.press.magnetic}
            plain={motion.press.plain}
          />
        </Section>

        <Section
          id="pick"
          title={motion.pick.title}
          description={motion.pick.description}
          tilt="right"
        >
          <PickDemo
            locale={locale}
            alt={sample.photoAlt}
            remove={motion.pick.remove}
            undo={motion.pick.undo}
          />
        </Section>

        <Section
          id="counts"
          title={motion.counts.title}
          description={motion.counts.description}
          tilt="left"
        >
          <CountDemo
            locale={locale}
            message={common.pieces}
            fewer={motion.counts.fewer}
            more={motion.counts.more}
          />
        </Section>

        <Section
          id="scanner"
          title={motion.scanner.title}
          description={motion.scanner.description}
          tilt="right"
        >
          <ScannerDemo alt={sample.photoAlt} />
        </Section>

        <Section
          id="apart"
          title={motion.apart.title}
          description={motion.apart.description}
          tilt="left"
        >
          <ApartDemo replay={motion.replay} />
        </Section>

        <Section
          id="steps"
          title={motion.steps.title}
          description={motion.steps.description}
          tilt="right"
        >
          <Link
            href={`/${locale}/scan?mockDelay=3000`}
            className={buttonStyles()}
          >
            {motion.steps.action} <span aria-hidden="true">→</span>
          </Link>
        </Section>

        <Section
          id="baseplate"
          title={motion.baseplate.title}
          description={motion.baseplate.description}
          tilt="left"
          bare
        >
          <div className="h-48" />
        </Section>

        <Section
          id="reduced"
          title={motion.reduced.title}
          description={motion.reduced.description}
          tilt="right"
        />
      </main>
    </MotionShowcase>
  );
}
