import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type StickerTone = "highlight" | "primary" | "paper";

const tones: Record<StickerTone, string> = {
  highlight: "bg-highlight text-highlight-foreground",
  primary: "bg-primary text-primary-foreground",
  paper: "bg-page text-ink",
};

/** A die-cut sticker: ink outline and hard shadow that scale with the text around it. */
export function Sticker({
  tone = "highlight",
  children,
  className,
}: {
  tone?: StickerTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cx("sticker", tones[tone], className)}>{children}</span>
  );
}
