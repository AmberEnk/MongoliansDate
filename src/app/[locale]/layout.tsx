import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary } from "@/lib/dictionary";
import { isLocale, locales, type Locale } from "@/lib/locales";
import "../globals.css";

const body = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
});

const display = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  variable: "--font-display-family",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: {
      default: dict.meta.title,
      template: `%s · ${dict.brand.short}`,
    },
    description: dict.meta.description,
    robots: { index: false, follow: false },
    icons: { icon: "/favicon.svg" },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${body.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
        >
          {dict.nav.skip}
        </a>
        <SiteHeader locale={locale} dict={dict} />
        <p className="border-b border-border bg-secondary px-5 py-2.5 text-center text-sm leading-relaxed text-secondary-foreground">
          {dict.sampleBanner}
        </p>
        <main id="content" className="flex-1">
          {children}
        </main>
        <SiteFooter locale={locale} dict={dict} />
      </body>
    </html>
  );
}
