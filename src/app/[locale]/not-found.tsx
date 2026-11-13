import Link from "next/link";
import { locale as localeParam } from "next/root-params";
import { buttonVariants } from "@/components/ui/button";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, isLocale } from "@/lib/locales";
import { cn } from "cn";

export default async function NotFound() {
  const value = await localeParam();
  const locale = isLocale(value) ? value : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-xl px-5 py-24 sm:px-8">
      <h1 className="font-display text-5xl tracking-tight">{dict.notFound.title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{dict.notFound.text}</p>
      <Link
        href={`/${locale}`}
        className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex h-11 px-5")}
      >
        {dict.notFound.home}
      </Link>
    </div>
  );
}
