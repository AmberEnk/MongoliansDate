import { HomePage } from "@/components/home-page";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/locales";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <HomePage locale={locale} dict={getDictionary(locale)} />;
}
