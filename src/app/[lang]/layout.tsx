import type { Metadata, Viewport } from "next";
import { Dela_Gothic_One, DM_Sans, JetBrains_Mono } from "next/font/google";
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
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((locale) => [locale, `/${locale}`]),
      ),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#fbf8f1",
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await currentLocale();
  return (
    <html
      lang={locale}
      className={`${delaGothic.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-page font-sans text-ink">
        {children}
      </body>
    </html>
  );
}
