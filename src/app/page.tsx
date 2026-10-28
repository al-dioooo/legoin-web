import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DetectedPhoto } from "@/components/ui/detected-photo";
import { Grain } from "@/components/ui/grain";
import { InventoryList } from "@/components/ui/inventory-list";
import { Marquee } from "@/components/ui/marquee";
import { Sticker } from "@/components/ui/sticker";
import {
  SAMPLE_BOXES,
  SAMPLE_DETECTIONS,
  SAMPLE_IDEA,
  SAMPLE_INVENTORY,
  SAMPLE_PHOTO,
  SAMPLE_SELECTED,
} from "@/lib/sample-scan";

const TAPE = [
  "Legoin",
  "Potret kepinganmu",
  "Hitung otomatis",
  "Tiga ide rakitan",
];

const missingCount = SAMPLE_IDEA.missing.reduce(
  (total, item) => total + item.quantity,
  0,
);

export default function Home() {
  return (
    <main className="flex flex-1 flex-col overflow-x-clip">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 pt-6 pb-12 sm:px-6 lg:grid-cols-[1fr_26rem] lg:items-start">
        <section className="relative">
          <Grain />
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border-[2.5px] border-ink bg-page px-4 py-2 shadow-sticker">
              <Logo />
            </span>
            <Badge>Sedang dibangun</Badge>
          </div>

          <p className="mt-14 font-mono text-xs font-bold tracking-[0.3em] uppercase">
            Pindai · Hitung · Rakit
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-display">
            Rakit dari <Sticker>kepingan</Sticker> yang kamu punya.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-secondary">
            Potret semua kepingan LEGO-mu dalam satu foto. Legoin mengenali
            jenis dan warnanya, lalu memberi tiga ide rakitan lengkap dengan
            part yang kurang.
          </p>
          <Link href="/desain" className={`${buttonStyles()} mt-8`}>
            Lihat sistem desain <span aria-hidden="true">↗</span>
          </Link>
          <ul className="mt-8 flex flex-wrap gap-2">
            <li>
              <Badge tone="highlight">13 jenis part</Badge>
            </li>
            <li>
              <Badge>10 warna</Badge>
            </li>
            <li>
              <Badge>3 ide per foto</Badge>
            </li>
          </ul>
        </section>

        <aside
          aria-labelledby="contoh-title"
          className="rounded-[2.5rem] border-[3px] border-ink bg-page p-5 shadow-raised"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="contoh-title" className="font-display text-2xl">
              Contoh hasil pindai
            </h2>
            <span className="font-mono text-xs font-bold whitespace-nowrap">
              {SAMPLE_DETECTIONS.length} kepingan
            </span>
          </div>
          <DetectedPhoto
            photo={SAMPLE_PHOTO}
            detections={SAMPLE_BOXES}
            selected={SAMPLE_SELECTED}
            sizes="(min-width: 1024px) 26rem, 100vw"
            priority
            className="mt-4"
          />
          <p className="mt-5 font-mono text-xs font-bold tracking-[0.25em] uppercase">
            Inventori
          </p>
          <InventoryList items={SAMPLE_INVENTORY} className="mt-2" />
          <Card className="mt-5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold">IDE 1/3</span>
              <span className="flex gap-1.5">
                <Badge tone="highlight">{SAMPLE_IDEA.difficulty}</Badge>
                <Badge tone="warning">Kurang {missingCount} part</Badge>
              </span>
            </div>
            <h3 className="mt-2 font-display text-2xl">{SAMPLE_IDEA.title}</h3>
            <p className="mt-1 text-sm text-ink-secondary">
              Badan merah, kap hijau, lampu kuning.
            </p>
            <Link
              href="/desain#contoh"
              className={`${buttonStyles({ size: "sm" })} mt-4`}
            >
              Lihat langkah <span aria-hidden="true">→</span>
            </Link>
          </Card>
        </aside>
      </div>

      <section aria-label="Legoin" className="py-10">
        <Marquee words={TAPE} tone="ink" className="-mx-4 -rotate-3" />
        <Marquee
          words={TAPE}
          tone="primary"
          reverse
          className="-mx-4 -mt-6 rotate-2"
        />
      </section>
    </main>
  );
}
