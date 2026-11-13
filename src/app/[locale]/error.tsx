"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/dictionary";
import { defaultLocale, isLocale } from "@/lib/locales";

export default function LocaleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const segment = pathname.split("/")[1] ?? "";
  const locale = isLocale(segment) ? segment : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-xl px-5 py-24 sm:px-8">
      <h1 className="font-display text-5xl tracking-tight">{dict.error.title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        {dict.error.text}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button type="button" className="h-11 px-5" onClick={() => reset()}>
          {dict.error.retry}
        </Button>
        <Button
          variant="outline"
          className="h-11 bg-card px-5"
          render={<Link href={`/${locale}`} />}
        >
          {dict.error.home}
        </Button>
      </div>
    </div>
  );
}
