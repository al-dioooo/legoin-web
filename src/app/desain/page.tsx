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
import { type Box, DetectionBox } from "@/components/ui/detection-box";
import { PartCallout } from "@/components/ui/part-callout";
import { Select } from "@/components/ui/select";
import { StepNumber } from "@/components/ui/step-number";
import {
  BRICK_COLORS,
  BRICK_PARTS,
  type BrickColorId,
  type BrickPartId,
  type PartCount,
} from "@/lib/bricks";

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
  { token: "highlight", note: "Sorotan, langkah aktif. Teks selalu tinta." },
  { token: "surface-page", note: "Latar halaman." },
  { token: "surface-card", note: "Kartu dan halaman buku." },
  { token: "surface-callout", note: "Kotak part." },
  { token: "text-primary", note: "Teks utama, garis, ikon." },
  { token: "text-secondary", note: "Teks pendukung." },
  { token: "border-strong", note: "Garis input dan bingkai part kurang." },
  { token: "overlay", note: "Kotak deteksi di atas foto." },
];

const USED: PartCount[] = [
  { part: "brick-2x4", color: "red", quantity: 2 },
  { part: "plate-2x4", color: "black", quantity: 1 },
  { part: "brick-1x2", color: "white", quantity: 4 },
  { part: "round-1x1", color: "yellow", quantity: 2 },
];

const MISSING: PartCount[] = [
  { part: "slope-2x2", color: "red", quantity: 1 },
  { part: "tile-1x2", color: "light-gray", quantity: 2 },
];

const DETECTIONS: {
  part: BrickPartId;
  color: BrickColorId;
  box: Box;
  confidence: number;
}[] = [
  {
    part: "brick-2x4",
    color: "red",
    box: { x: 0.12, y: 0.2, width: 0.3, height: 0.2 },
    confidence: 0.94,
  },
  {
    part: "brick-2x2",
    color: "yellow",
    box: { x: 0.56, y: 0.14, width: 0.16, height: 0.22 },
    confidence: 0.88,
  },
  {
    part: "plate-1x2",
    color: "blue",
    box: { x: 0.3, y: 0.58, width: 0.16, height: 0.11 },
    confidence: 0.81,
  },
  {
    part: "slope-2x2",
    color: "green",
    box: { x: 0.66, y: 0.56, width: 0.16, height: 0.22 },
    confidence: 0.76,
  },
];

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
      className="border-t border-line py-10"
    >
      <h2 id={`${id}-title`} className="text-2xl font-extrabold tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-2xl text-ink-secondary">{description}</p>
      )}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
      <header className="py-10">
        <Link href="/" className="inline-block rounded-md">
          <Logo />
        </Link>
        <h1 className="mt-8 text-display">Sistem desain</h1>
        <p className="mt-3 max-w-2xl text-lg text-ink-secondary">
          Arah “Buku instruksi”: halaman putih, kotak part dengan jumlah, dan
          langkah bernomor. Merah untuk aksi, kuning untuk sorotan, warna
          kepingan hanya untuk kepingan.
        </p>
      </header>

      <Section
        id="warna"
        title="Warna"
        description="Skala dibangun di sekitar warna LEGO asli (nilai Rebrickable). Komponen hanya memakai peran, bukan skala."
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
        description="Plus Jakarta Sans untuk semua teks. JetBrains Mono untuk jumlah, nomor part, dan skor."
      >
        <div className="space-y-5">
          <p className="text-display">Rakit dari yang kamu punya.</p>
          <p className="text-3xl font-extrabold tracking-tight">
            Judul halaman 30/800
          </p>
          <p className="text-xl font-bold">Judul bagian 20/700</p>
          <p className="max-w-2xl text-base leading-relaxed">
            Teks isi 16/400. Potret semua kepingan dari atas di latar polos,
            jangan ditumpuk. Legoin menghitung jenis dan warnanya, lalu
            menyarankan tiga ide rakitan.
          </p>
          <p className="text-sm text-ink-secondary">
            Teks kecil 14/400 untuk keterangan.
          </p>
          <p className="font-mono text-sm font-bold">
            3001 · Brick 2×4 · 3× · 0,94
          </p>
        </div>
      </Section>

      <Section
        id="logo"
        title="Logo"
        description="Brick 2×2 kuning di dalam bingkai pemindai. Bukan kotak merah, dan merah tidak dipakai bersama kuning di logo."
      >
        <div className="flex flex-wrap items-end gap-8">
          <Logo />
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
        description="Satu tombol merah per layar. Aksi berbahaya memakai garis merah dan konfirmasi, bukan isi merah."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Pindai kepingan</Button>
            <Button variant="secondary">Unggah foto</Button>
            <Button variant="highlight">Pilih tema</Button>
            <Button variant="ghost">Lewati</Button>
            <Button variant="danger">Hapus scan</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
        description="Status selalu titik dan label, tidak pernah warna saja."
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
        id="kepingan"
        title="Kepingan"
        description="13 part MVP digambar dari atas, seperti di buku instruksi."
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {(Object.keys(BRICK_PARTS) as BrickPartId[]).map((part) => (
            <div
              key={part}
              className="flex flex-col items-start gap-2 rounded-callout bg-callout p-3"
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
          <PartCallout title="Part dipakai" parts={USED} />
          <PartCallout title="Part kurang" parts={MISSING} missing />
          <PartCallout
            title="Inventori (detail)"
            parts={USED}
            detailed
            className="md:col-span-2"
          />
        </div>
      </Section>

      <Section
        id="deteksi"
        title="Deteksi"
        description="Kotak deteksi bertinta dengan halo putih, terbaca di atas kepingan warna apa pun. Kotak terpilih lebih tebal."
      >
        <div className="relative aspect-[4/3] w-full max-w-xl overflow-hidden rounded-card bg-callout">
          {DETECTIONS.map((detection) => (
            <div
              key={detection.part}
              className="absolute flex items-center justify-center"
              style={{
                left: `${detection.box.x * 100}%`,
                top: `${detection.box.y * 100}%`,
                width: `${detection.box.width * 100}%`,
                height: `${detection.box.height * 100}%`,
              }}
            >
              <BrickGlyph
                part={detection.part}
                color={detection.color}
                unit={28}
                className="h-[80%] w-[80%]"
              />
            </div>
          ))}
          {DETECTIONS.map((detection, index) => (
            <DetectionBox
              key={detection.part}
              box={detection.box}
              selected={index === 0}
              label={`${BRICK_PARTS[detection.part].label} · ${detection.confidence.toFixed(2).replace(".", ",")}`}
            />
          ))}
        </div>
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
        description="Satu ide rakitan dari AI agent: part dipakai, part kurang, dan langkah singkat."
      >
        <Card className="max-w-2xl space-y-5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-sm font-bold text-ink-secondary">
                Ide 1 dari 3
              </p>
              <h3 className="text-2xl font-extrabold tracking-tight">
                Mobil balap kecil
              </h3>
            </div>
            <Badge tone="highlight">Mudah</Badge>
          </div>
          <PartCallout title="Part dipakai" parts={USED} />
          <PartCallout title="Part kurang" parts={MISSING} missing />
          <ol className="space-y-3">
            {[
              "Letakkan plate 2×4 hitam sebagai sasis.",
              "Pasang dua brick 2×4 merah di atasnya sebagai badan.",
              "Tambahkan round 1×1 kuning di depan sebagai lampu.",
            ].map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                <StepNumber value={index + 1} />
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-3">
            <Button>Simpan ide</Button>
            <Button variant="secondary">Ide lain</Button>
          </div>
        </Card>
      </Section>
    </main>
  );
}
