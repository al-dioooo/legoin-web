import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6">
      <Logo />
      <div className="flex flex-1 flex-col justify-center gap-6 py-16">
        <Badge className="self-start">Sedang dibangun</Badge>
        <h1 className="max-w-2xl text-display">
          Rakit dari kepingan yang kamu punya.
        </h1>
        <p className="max-w-xl text-lg text-ink-secondary">
          Potret kepingan LEGO-mu dalam satu foto. Legoin mengenali jenis dan
          warnanya, lalu memberi tiga ide rakitan lengkap dengan part yang
          kurang.
        </p>
        <Link
          href="/desain"
          className={`${buttonStyles({ variant: "secondary" })} self-start`}
        >
          Lihat sistem desain
        </Link>
      </div>
    </main>
  );
}
