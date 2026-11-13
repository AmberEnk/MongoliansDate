import Link from "next/link";
import { Suspense } from "react";
import { LanguageLinks, LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { Meander } from "@/components/textile";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/locales";
import { siteLinks } from "@/lib/navigation";

export function SiteFooter({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const links = siteLinks(locale, dict);

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <Meander className="mb-10 max-w-xs text-clay" />
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo locale={locale} label={dict.nav.home} />
            <p className="mt-4 max-w-sm font-display text-2xl leading-snug text-foreground">
              {dict.brand.tagline}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">{dict.footer.note}</p>
          </div>
          <nav aria-label={dict.footer.explore}>
            <p className="text-xs tracking-[0.18em] text-clay uppercase">
              {dict.footer.explore}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {links.all.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-clay">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="text-xs tracking-[0.18em] text-clay uppercase">
              {dict.nav.language}
            </p>
            <div className="mt-4">
              <Suspense
                fallback={
                  <LanguageLinks
                    locale={locale}
                    label={dict.nav.language}
                    pathname={`/${locale}`}
                  />
                }
              >
                <LanguageSwitcher locale={locale} label={dict.nav.language} />
              </Suspense>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">{dict.footer.place}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
