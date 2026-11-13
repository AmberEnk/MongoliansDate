import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SellerForm } from "@/components/seller-form";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.meta.sellTitle,
    description: dict.meta.sellDescription,
  };
}

export default async function SellPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-24">
      <div>
        <p className="text-xs tracking-[0.22em] text-clay uppercase">
          {dict.sell.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-5xl tracking-tight text-balance md:text-6xl">
          {dict.sell.title}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          {dict.sell.pageLede}
        </p>
        <ul className="mt-8 grid gap-3 text-sm leading-relaxed">
          {dict.sell.points.map((point) => (
            <li key={point} className="border-l-2 border-clay pl-4">
              {point}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm leading-relaxed text-foreground">
          {dict.sell.refusal}
        </p>
      </div>
      <SellerForm locale={locale} copy={dict.sell} />
    </div>
  );
}
