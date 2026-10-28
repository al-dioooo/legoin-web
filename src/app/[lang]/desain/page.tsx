import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { TokenSwatch } from "@/components/desain/token-swatch";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Badge } from "@/components/ui/badge";
import { BrickGlyph } from "@/components/ui/brick-glyph";
import { BrickSwatch } from "@/components/ui/brick-swatch";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DetectedPhoto } from "@/components/ui/detected-photo";
import { Grain } from "@/components/ui/grain";
import { InventoryList } from "@/components/ui/inventory-list";
import { Marquee } from "@/components/ui/marquee";
import { PartCallout } from "@/components/ui/part-callout";
import { Select } from "@/components/ui/select";
import { StepNumber } from "@/components/ui/step-number";
import { Sticker } from "@/components/ui/sticker";
import { currentLocale, getDictionary } from "@/i18n/dictionaries";
import { fill, plural } from "@/i18n/format";
import {
  BRICK_COLORS,
  BRICK_PARTS,
  type BrickColorId,
  type BrickPartId,
  colorLabel,
  formatConfidence,
} from "@/lib/bricks";
import {
  SAMPLE_IDEA,
  SAMPLE_INVENTORY,
  SAMPLE_MISSING_COUNT,
  SAMPLE_PHOTO,
  sampleBoxes,
} from "@/lib/sample-scan";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.meta.designSystem };
}

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const SCALES = [
  { name: "red", anchor: 600, note: "LEGO Red" },
  { name: "yellow", anchor: 300, note: "LEGO Yellow" },
  { name: "green", anchor: 700, note: "LEGO Green" },
  { name: "neutral", anchor: 950, note: "LEGO Black" },
];

/** Token name and the dictionary key of its note. */
const ROLES = [
  { token: "primary", note: "primary" },
  { token: "highlight", note: "highlight" },
  { token: "surface-page", note: "page" },
  { token: "surface-card", note: "card" },
  { token: "text-primary", note: "ink" },
  { token: "text-secondary", note: "inkSecondary" },
  { token: "warning-subtle", note: "warning" },
  { token: "success-subtle", note: "success" },
  { token: "overlay", note: "overlay" },
] as const;

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="border-t-[2.5px] border-ink py-12"
    >
      <h2 id={`${id}-title`} className="font-display text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-2xl text-ink-secondary">{description}</p>
      )}
      <div className="mt-8">{children}</div>
    </section>
  );
}

export default async function DesignSystemPage() {
  const locale = await currentLocale();
  const dict = await getDictionary();
  const { design, common, sample } = dict;

  return (
    <main className="mx-auto w-full max-w-5xl overflow-x-clip px-4 pb-16 sm:px-6">
      <header className="relative py-10">
        <Grain />
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/${locale}`}
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
        </div>
        <h1 className="mt-10 font-display text-display">
          {design.title.before}
          <Sticker>{design.title.sticker}</Sticker>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-secondary">
          {design.intro}
        </p>
      </header>

      <Section
        id="colors"
        title={design.colors.title}
        description={design.colors.description}
      >
        <div className="space-y-8">
          {SCALES.map((scale) => (
            <div key={scale.name}>
              <p className="mb-3 text-sm font-bold">
                {scale.name}{" "}
                <span className="font-normal text-ink-secondary">
                  ·{" "}
                  {fill(design.colors.scaleNote, {
                    name: scale.note,
                    step: scale.anchor,
                  })}
                </span>
              </p>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-11">
                {STEPS.map((step) => (
                  <TokenSwatch
                    key={step}
                    token={`${scale.name}-${step}`}
                    label={String(step)}
                    className={
                      step === scale.anchor
                        ? "rounded-callout outline-2 outline-offset-4 outline-ink"
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          ))}

          <div>
            <p className="mb-3 text-sm font-bold">{design.colors.roles}</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {ROLES.map((role) => (
                <TokenSwatch
                  key={role.token}
                  token={role.token}
                  note={design.colors.roleNotes[role.note]}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold">
              {design.colors.bricks}{" "}
              <span className="font-normal text-ink-secondary">
                · {design.colors.bricksNote}
              </span>
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {(Object.keys(BRICK_COLORS) as BrickColorId[]).map((color) => (
                <BrickSwatch key={color} color={color} locale={locale} />
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="type"
        title={design.type.title}
        description={design.type.description}
      >
        <div className="space-y-5">
          <p className="font-display text-display">{design.type.display}</p>
          <p className="font-display text-3xl">{design.type.pageTitle}</p>
          <p className="font-display text-xl">{design.type.cardTitle}</p>
          <p className="max-w-2xl text-base leading-relaxed">
            {design.type.body}
          </p>
          <p className="text-sm text-ink-secondary">{design.type.small}</p>
          <p className="font-mono text-xs font-bold tracking-[0.3em] uppercase">
            {design.type.monoLabel}
          </p>
          <p className="font-mono text-sm font-bold">
            3001 · Brick 2×4 · 3× · {formatConfidence(0.94, locale)}
          </p>
        </div>
      </Section>

      <Section
        id="logo"
        title={design.logo.title}
        description={design.logo.description}
      >
        <div className="flex flex-wrap items-end gap-8">
          <span className="inline-flex rounded-full border-[2.5px] border-ink bg-page px-4 py-2 shadow-sticker">
            <Logo />
          </span>
          {[16, 24, 32, 48].map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <span style={{ width: size, height: size }}>
                <LogoMark title="Legoin" className="size-full" />
              </span>
              <span className="font-mono text-xs text-ink-secondary">
                {size}px
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="buttons"
        title={design.buttons.title}
        description={design.buttons.description}
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <Button>{design.buttons.scan}</Button>
            <Button variant="secondary">{design.buttons.upload}</Button>
            <Button variant="highlight">{design.buttons.theme}</Button>
            <Button variant="ghost">{design.buttons.skip}</Button>
            <Button variant="danger">{design.buttons.remove}</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">{design.buttons.scan}</Button>
            <Button size="sm" variant="secondary">
              {design.buttons.upload}
            </Button>
            <Button size="sm" disabled>
              {design.buttons.processing}
            </Button>
            <Link
              href={`/${locale}`}
              className={buttonStyles({ variant: "secondary" })}
            >
              {design.buttons.link}
            </Link>
          </div>
        </div>
      </Section>

      <Section
        id="status"
        title={design.status.title}
        description={design.status.description}
      >
        <div className="flex flex-wrap gap-3">
          <Badge tone="success">{design.status.available}</Badge>
          <Badge tone="warning">
            {plural(common.missingCount, SAMPLE_MISSING_COUNT, locale)}
          </Badge>
          <Badge tone="danger">{design.status.failed}</Badge>
          <Badge tone="highlight">{sample.idea.difficulty}</Badge>
          <Badge>{design.status.draft}</Badge>
        </div>
      </Section>

      <Section
        id="stickers"
        title={design.stickers.title}
        description={design.stickers.description}
      >
        <div className="space-y-10">
          <p className="font-display text-4xl leading-tight">
            <Sticker>{design.stickers.yellow}</Sticker>{" "}
            <Sticker tone="primary">{design.stickers.red}</Sticker>{" "}
            <Sticker tone="paper">{design.stickers.paper}</Sticker>
          </p>
          <div className="relative grid h-40 place-items-center overflow-hidden rounded-card border-[2.5px] border-ink bg-highlight">
            <Grain />
            <p className="font-display text-2xl">{design.stickers.grain}</p>
          </div>
          <div className="-mx-4 overflow-x-clip py-6 sm:-mx-6">
            <Marquee
              words={design.stickers.tape}
              tone="ink"
              className="-rotate-2"
            />
            <Marquee
              words={design.stickers.tape}
              tone="highlight"
              reverse
              className="-mt-4 rotate-1"
            />
          </div>
        </div>
      </Section>

      <Section
        id="pieces"
        title={design.pieces.title}
        description={design.pieces.description}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {(Object.keys(BRICK_PARTS) as BrickPartId[]).map((part) => (
            <div
              key={part}
              className="flex flex-col items-start gap-2 rounded-callout border-2 border-ink bg-card p-3"
            >
              <div className="flex h-16 items-center">
                <BrickGlyph part={part} color="light-gray" unit={14} />
              </div>
              <span className="text-sm font-semibold">
                {BRICK_PARTS[part].label}
              </span>
              <span className="font-mono text-xs text-ink-secondary">
                {BRICK_PARTS[part].designId}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <PartCallout
            title={common.partsUsed}
            parts={SAMPLE_IDEA.used}
            locale={locale}
          />
          <PartCallout
            title={common.partsMissing}
            parts={SAMPLE_IDEA.missing}
            locale={locale}
            missing
          />
          <PartCallout
            title={common.inventoryDetailed}
            parts={SAMPLE_INVENTORY}
            locale={locale}
            detailed
            className="md:col-span-2"
          />
        </div>
        <InventoryList
          items={SAMPLE_INVENTORY}
          locale={locale}
          className="mt-6 max-w-md"
        />
      </Section>

      <Section
        id="detection"
        title={design.detection.title}
        description={design.detection.description}
      >
        <DetectedPhoto
          photo={SAMPLE_PHOTO}
          alt={sample.photoAlt}
          detections={sampleBoxes(locale)}
          className="max-w-xl"
        />
      </Section>

      <Section
        id="correction"
        title={design.correction.title}
        description={design.correction.description}
      >
        <Card className="flex max-w-xl flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex h-12 shrink-0 items-center">
            <BrickGlyph part="brick-2x4" color="red" />
          </div>
          <Select label={design.correction.part} defaultValue="brick-2x4">
            {(Object.keys(BRICK_PARTS) as BrickPartId[]).map((part) => (
              <option key={part} value={part}>
                {BRICK_PARTS[part].label}
              </option>
            ))}
          </Select>
          <Select label={design.correction.color} defaultValue="red">
            {(Object.keys(BRICK_COLORS) as BrickColorId[]).map((color) => (
              <option key={color} value={color}>
                {colorLabel(color, locale)}
              </option>
            ))}
          </Select>
        </Card>
      </Section>

      <Section
        id="example"
        title={design.example.title}
        description={design.example.description}
      >
        <Card className="max-w-2xl space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-bold">
                {fill(common.ideaOf, { index: 1, total: 3 })}
              </p>
              <h3 className="mt-1 font-display text-3xl">
                {sample.idea.title}
              </h3>
            </div>
            <span className="flex gap-2">
              <Badge tone="highlight">{sample.idea.difficulty}</Badge>
              <Badge tone="warning">
                {plural(common.missingCount, SAMPLE_MISSING_COUNT, locale)}
              </Badge>
            </span>
          </div>
          <PartCallout
            title={common.partsUsed}
            parts={SAMPLE_IDEA.used}
            locale={locale}
          />
          <PartCallout
            title={common.partsMissing}
            parts={SAMPLE_IDEA.missing}
            locale={locale}
            missing
          />
          <ol className="space-y-3">
            {sample.idea.steps.map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                <StepNumber value={index + 1} label={common.step} />
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-4">
            <Button>{design.example.save}</Button>
            <Button variant="secondary">{design.example.another}</Button>
          </div>
        </Card>
      </Section>
    </main>
  );
}
