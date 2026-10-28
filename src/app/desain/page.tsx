import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { TokenSwatch } from "@/components/desain/token-swatch";
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
import {
  BRICK_COLORS,
  BRICK_PARTS,
  type BrickColorId,
  type BrickPartId,
} from "@/lib/bricks";
import {
  SAMPLE_BOXES,
  SAMPLE_IDEA,
  SAMPLE_INVENTORY,
  SAMPLE_PHOTO,
  SAMPLE_SELECTED,
} from "@/lib/sample-scan";

export const metadata: Metadata = { title: "Sistem desain" };

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const SCALES = [
  { name: "red", anchor: 600, note: "LEGO Red" },
  { name: "yellow", anchor: 300, note: "LEGO Yellow" },
  { name: "green", anchor: 700, note: "LEGO Green" },
  { name: "neutral", anchor: 950, note: "LEGO Black" },
];

const ROLES = [
  { token: "primary", note: "Aksi utama. Satu per layar." },
  { token: "highlight", note: "Stiker, sorotan, langkah. Teks selalu tinta." },
  { token: "surface-page", note: "Kertas dari ballers-addict." },
  { token: "surface-card", note: "Panel dan kartu." },
  { token: "text-primary", note: "Tinta: teks, garis, bayangan keras." },
  { token: "text-secondary", note: "Teks pendukung." },
  { token: "warning-subtle", note: "Part kurang." },
  { token: "success-subtle", note: "Tersedia." },
  { token: "overlay", note: "Kotak deteksi di atas foto." },
];

const TAPE = ["Legoin", "Potret", "Hitung", "Rakit"];

const missingCount = SAMPLE_IDEA.missing.reduce(
  (total, item) => total + item.quantity,
  0,
);

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

export default function DesignSystemPage() {
  return (
    <main className="mx-auto w-full max-w-5xl overflow-x-clip px-4 pb-16 sm:px-6">
      <header className="relative py-10">
        <Grain />
        <Link
          href="/"
          className="inline-flex rounded-full border-[2.5px] border-ink bg-page px-4 py-2 shadow-sticker transition-transform duration-300 ease-spring hover:-rotate-3"
        >
          <Logo />
        </Link>
        <h1 className="mt-10 font-display text-display">
          Sistem <Sticker>desain</Sticker>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-secondary">
          Gaya ballers-addict dengan warna LEGO: kertas, garis tinta, bayangan
          keras, dan stiker. Merah untuk aksi, kuning untuk sorotan, warna
          kepingan hanya untuk kepingan.
        </p>
      </header>

      <Section
        id="warna"
        title="Warna"
        description="Skala dibangun di sekitar warna LEGO asli (nilai Rebrickable), di atas kertas hangat dari ballers-addict. Komponen hanya memakai peran, bukan skala."
      >
        <div className="space-y-8">
          {SCALES.map((scale) => (
            <div key={scale.name}>
              <p className="mb-3 text-sm font-bold">
                {scale.name}{" "}
                <span className="font-normal text-ink-secondary">
                  · {scale.note} di {scale.anchor}
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
            <p className="mb-3 text-sm font-bold">Peran</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {ROLES.map((role) => (
                <TokenSwatch
                  key={role.token}
                  token={role.token}
                  note={role.note}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-bold">
              Warna kepingan{" "}
              <span className="font-normal text-ink-secondary">
                · data, bukan UI. Selalu dengan nama warnanya.
              </span>
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {(Object.keys(BRICK_COLORS) as BrickColorId[]).map((color) => (
                <BrickSwatch key={color} color={color} />
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="huruf"
        title="Huruf"
        description="Dela Gothic One untuk judul (satu ketebalan, jangan ditebalkan). DM Sans untuk teks. JetBrains Mono untuk jumlah, nomor part, dan skor."
      >
        <div className="space-y-5">
          <p className="font-display text-display">
            Rakit dari yang kamu punya.
          </p>
          <p className="font-display text-3xl">
            Judul halaman · Dela Gothic One
          </p>
          <p className="font-display text-xl">Judul kartu · Dela Gothic One</p>
          <p className="max-w-2xl text-base leading-relaxed">
            Teks isi DM Sans 16. Potret semua kepingan dari atas di latar polos,
            jangan ditumpuk. Legoin menghitung jenis dan warnanya, lalu
            menyarankan tiga ide rakitan.
          </p>
          <p className="text-sm text-ink-secondary">
            Teks kecil DM Sans 14 untuk keterangan.
          </p>
          <p className="font-mono text-xs font-bold tracking-[0.3em] uppercase">
            Label mono · Inventori
          </p>
          <p className="font-mono text-sm font-bold">
            3001 · Brick 2×4 · 3× · 0,94
          </p>
        </div>
      </Section>

      <Section
        id="logo"
        title="Logo"
        description="Brick 2×2 kuning di dalam bingkai pemindai, dengan wordmark Dela Gothic One. Logo tidak memakai merah, jadi tidak pernah merah dengan kuning."
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
        id="tombol"
        title="Tombol"
        description="Tombol berisi punya bayangan tinta keras dan tertekan saat diklik; semua miring sedikit saat disorot. Satu tombol merah per layar. Aksi berbahaya memakai garis merah dan konfirmasi."
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <Button>Pindai kepingan</Button>
            <Button variant="secondary">Unggah foto</Button>
            <Button variant="highlight">Pilih tema</Button>
            <Button variant="ghost">Lewati</Button>
            <Button variant="danger">Hapus scan</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Pindai kepingan</Button>
            <Button size="sm" variant="secondary">
              Unggah foto
            </Button>
            <Button size="sm" disabled>
              Memproses…
            </Button>
            <Link href="/" className={buttonStyles({ variant: "secondary" })}>
              Tautan sebagai tombol
            </Link>
          </div>
        </div>
      </Section>

      <Section
        id="status"
        title="Status"
        description="Status selalu titik dan label bertinta, tidak pernah warna saja."
      >
        <div className="flex flex-wrap gap-3">
          <Badge tone="success">Tersedia</Badge>
          <Badge tone="warning">Kurang 3 part</Badge>
          <Badge tone="danger">Gagal mendeteksi</Badge>
          <Badge tone="highlight">Mudah</Badge>
          <Badge>Draf</Badge>
        </div>
      </Section>

      <Section
        id="stiker"
        title="Stiker, grain, dan pita"
        description="Stiker menyorot satu kata. Grain hanya di area pemasaran, tidak pernah di atas foto atau inventori. Pita berjalan pelan dan berhenti saat gerak dikurangi."
      >
        <div className="space-y-10">
          <p className="font-display text-4xl leading-tight">
            <Sticker>Kuning</Sticker> <Sticker tone="primary">Merah</Sticker>{" "}
            <Sticker tone="paper">Kertas</Sticker>
          </p>
          <div className="relative grid h-40 place-items-center overflow-hidden rounded-card border-[2.5px] border-ink bg-highlight">
            <Grain />
            <p className="font-display text-2xl">Grain di atas warna</p>
          </div>
          <div className="-mx-4 overflow-x-clip py-6 sm:-mx-6">
            <Marquee words={TAPE} tone="ink" className="-rotate-2" />
            <Marquee
              words={TAPE}
              tone="highlight"
              reverse
              className="-mt-4 rotate-1"
            />
          </div>
        </div>
      </Section>

      <Section
        id="kepingan"
        title="Kepingan"
        description="13 part MVP digambar dari atas dengan garis tinta."
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
          <PartCallout title="Part dipakai" parts={SAMPLE_IDEA.used} />
          <PartCallout
            title="Part kurang"
            parts={SAMPLE_IDEA.missing}
            missing
          />
          <PartCallout
            title="Inventori (detail)"
            parts={SAMPLE_INVENTORY}
            detailed
            className="md:col-span-2"
          />
        </div>
        <InventoryList items={SAMPLE_INVENTORY} className="mt-6 max-w-md" />
      </Section>

      <Section
        id="deteksi"
        title="Deteksi"
        description="Kotak bertinta dengan halo putih, terbaca di atas kepingan warna apa pun. Kotak terpilih lebih tebal dan menampilkan skor. Foto contoh dibuat dengan Codex image generation."
      >
        <DetectedPhoto
          photo={SAMPLE_PHOTO}
          detections={SAMPLE_BOXES}
          selected={SAMPLE_SELECTED}
          sizes="(min-width: 640px) 36rem, 100vw"
          className="max-w-xl"
        />
      </Section>

      <Section
        id="koreksi"
        title="Koreksi label"
        description="Pengguna bisa memperbaiki jenis dan warna sebelum meminta rekomendasi."
      >
        <Card className="flex max-w-xl flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex h-12 shrink-0 items-center">
            <BrickGlyph part="brick-2x4" color="red" />
          </div>
          <Select label="Jenis part" defaultValue="brick-2x4">
            {(Object.keys(BRICK_PARTS) as BrickPartId[]).map((part) => (
              <option key={part} value={part}>
                {BRICK_PARTS[part].label}
              </option>
            ))}
          </Select>
          <Select label="Warna" defaultValue="red">
            {(Object.keys(BRICK_COLORS) as BrickColorId[]).map((color) => (
              <option key={color} value={color}>
                {BRICK_COLORS[color].label}
              </option>
            ))}
          </Select>
        </Card>
      </Section>

      <Section
        id="contoh"
        title="Contoh: kartu rekomendasi"
        description="Satu ide rakitan dari AI agent untuk inventori contoh: part dipakai, part kurang, dan langkah singkat."
      >
        <Card className="max-w-2xl space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-bold">IDE 1/3</p>
              <h3 className="mt-1 font-display text-3xl">
                {SAMPLE_IDEA.title}
              </h3>
            </div>
            <span className="flex gap-2">
              <Badge tone="highlight">{SAMPLE_IDEA.difficulty}</Badge>
              <Badge tone="warning">Kurang {missingCount} part</Badge>
            </span>
          </div>
          <PartCallout title="Part dipakai" parts={SAMPLE_IDEA.used} />
          <PartCallout
            title="Part kurang"
            parts={SAMPLE_IDEA.missing}
            missing
          />
          <ol className="space-y-3">
            {SAMPLE_IDEA.steps.map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                <StepNumber value={index + 1} />
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-4">
            <Button>Simpan ide</Button>
            <Button variant="secondary">Ide lain</Button>
          </div>
        </Card>
      </Section>
    </main>
  );
}
