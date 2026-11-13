"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/locales";

const labels: Record<Locale, string> = {
  mn: "МН",
  en: "EN",
};

export function LanguageSwitcher({
  locale,
  label,
}: {
  locale: Locale;
  label: string;
}) {
  const pathname = usePathname();
  return <LanguageLinks locale={locale} label={label} pathname={pathname} />;
}

export function LanguageLinks({
  locale,
  label,
  pathname,
}: {
  locale: Locale;
  label: string;
  pathname: string;
}) {
  const rest = pathname.replace(/^\/(mn|en)(?=\/|$)/, "") || "";

  return (
    <nav aria-label={label} className="flex items-center gap-1 text-sm">
      {locales.map((item, index) => (
        <span key={item} className="flex items-center gap-1">
          {index > 0 ? (
            <span aria-hidden="true" className="text-border">
              /
            </span>
          ) : null}
          <Link
            href={`/${item}${rest}`}
            hrefLang={item}
            lang={item}
            aria-current={item === locale ? "page" : undefined}
            className={
              item === locale
                ? "font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }
          >
            {labels[item]}
          </Link>
        </span>
      ))}
    </nav>
  );
}
