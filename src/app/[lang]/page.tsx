import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DetectedPhoto } from "@/components/ui/detected-photo";
import { Grain } from "@/components/ui/grain";
import { InventoryList } from "@/components/ui/inventory-list";
import { Marquee } from "@/components/ui/marquee";
import { Sticker } from "@/components/ui/sticker";
import { currentLocale, getDictionary } from "@/i18n/dictionaries";
import {
  SAMPLE_DETECTIONS,
  SAMPLE_INVENTORY,
  SAMPLE_MISSING_COUNT,
  SAMPLE_PHOTO,
  sampleBoxes,
} from "@/lib/sample-scan";

export default async function Home() {
  const locale = await currentLocale();
  const dict = await getDictionary();
  const { home, sample, common } = dict;

  return (
    <main className="flex flex-1 flex-col overflow-x-clip">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 pt-6 pb-12 sm:px-6 lg:grid-cols-[1fr_26rem] lg:items-start">
        <section className="relative">
          <Grain />
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border-[2.5px] border-ink bg-page px-4 py-2 shadow-sticker">
              <Logo />
            </span>
            <Badge>{common.inProgress}</Badge>
            <LanguageSwitcher
              current={locale}
              label={dict.language.label}
              names={dict.language.names}
              className="ml-auto"
            />
          </div>

          <p className="mt-14 font-mono text-xs font-bold tracking-[0.3em] uppercase">
            {home.eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-display">
            {home.title.before}
            <Sticker>{home.title.sticker}</Sticker>
            {home.title.after}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-secondary">
            {home.lead}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href={`/${locale}/scan`} className={buttonStyles()}>
              {home.ctaScan} <span aria-hidden="true">→</span>
            </Link>
            <Link
              href={`/${locale}/desain`}
              className={buttonStyles({ variant: "secondary" })}
            >
              {home.ctaDesign}
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-2">
            <li>
              <Badge tone="highlight">{home.facts.parts}</Badge>
            </li>
            <li>
              <Badge>{home.facts.colors}</Badge>
            </li>
            <li>
              <Badge>{home.facts.ideas}</Badge>
            </li>
          </ul>
        </section>

        <aside
          aria-labelledby="sample-title"
          className="rounded-[2.5rem] border-[3px] border-ink bg-page p-5 shadow-raised"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="sample-title" className="font-display text-2xl">
              {sample.title}
            </h2>
            <span className="font-mono text-xs font-bold whitespace-nowrap">
              {common.pieces(SAMPLE_DETECTIONS.length)}
            </span>
          </div>
          <DetectedPhoto
            photo={SAMPLE_PHOTO}
            alt={sample.photoAlt}
            detections={sampleBoxes(locale)}
            sizes="(min-width: 1024px) 26rem, 100vw"
            priority
            className="mt-4"
          />
          <p className="mt-5 font-mono text-xs font-bold tracking-[0.25em] uppercase">
            {common.inventory}
          </p>
          <InventoryList
            items={SAMPLE_INVENTORY}
            locale={locale}
            className="mt-2"
          />
          <Card className="mt-5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold">
                {common.ideaOf(1, 3)}
              </span>
              <span className="flex gap-1.5">
                <Badge tone="highlight">{sample.idea.difficulty}</Badge>
                <Badge tone="warning">
                  {common.missingCount(SAMPLE_MISSING_COUNT)}
                </Badge>
              </span>
            </div>
            <h3 className="mt-2 font-display text-2xl">{sample.idea.title}</h3>
            <p className="mt-1 text-sm text-ink-secondary">
              {sample.idea.summary}
            </p>
            <Link
              href={`/${locale}/desain#example`}
              className={`${buttonStyles({ size: "sm" })} mt-4`}
            >
              {sample.seeSteps} <span aria-hidden="true">→</span>
            </Link>
          </Card>
        </aside>
      </div>

      <section aria-label="Legoin" className="py-10">
        <Marquee words={home.tape} tone="ink" className="-mx-4 -rotate-3" />
        <Marquee
          words={home.tape}
          tone="primary"
          reverse
          className="-mx-4 -mt-6 rotate-2"
        />
      </section>
    </main>
  );
}
