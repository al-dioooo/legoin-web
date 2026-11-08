import type { Metadata, Viewport } from "next";
import { Dela_Gothic_One, DM_Sans, JetBrains_Mono } from "next/font/google";
import { SkipLink } from "@/components/app/skip-link";
import { StudGlow } from "@/components/motion/stud-glow";
import { SiteFooter } from "@/components/site-footer";
import { currentLocale, getDictionary } from "@/i18n/dictionaries";
import { LOCALES } from "@/i18n/locales";
import "../globals.css";

const delaGothic = Dela_Gothic_One({
  variable: "--font-dela-gothic",
  weight: "400",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  axes: ["opsz"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: {
      default: "Legoin",
      template: "%s · Legoin",
    },
    description: dict.meta.description,
    // Each page sets its own `alternates`, since only the page knows its path.
  };
}

export const viewport: Viewport = {
  themeColor: "#fbf8f1",
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await currentLocale();
  const dict = await getDictionary();
  return (
    <html
      lang={locale}
      className={`${delaGothic.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-page font-sans text-ink">
        <SkipLink label={dict.app.skip} />
        {/* Every page sits on one baseplate (ADR-0006), drawn here and nowhere
            else. The footer stays off it, so the glow stops at its edge. The
            clip catches what hangs off the sides, such as step numerals and
            tilted tape. */}
        <div className="baseplate flex flex-1 flex-col overflow-x-clip">
          <StudGlow />
          {children}
        </div>
        <SiteFooter
          copy={{ ...dict.footer, designSystem: dict.meta.designSystem }}
          locale={locale}
        />
      </body>
    </html>
  );
}
