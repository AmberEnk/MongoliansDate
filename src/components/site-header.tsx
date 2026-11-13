import Link from "next/link";
import { Suspense } from "react";
import { LanguageLinks, LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/locales";
import { siteLinks } from "@/lib/navigation";

export function SiteHeader({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const links = siteLinks(locale, dict);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="h-1 bg-clay" />
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 sm:gap-6 sm:px-8">
        <Logo locale={locale} label={dict.nav.home} className="mr-auto" />
        <nav
          aria-label={dict.nav.home}
          className="hidden items-center gap-6 text-sm lg:flex"
        >
          {links.primary.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/80 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
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
        <div className="lg:hidden">
          <MobileNav
            links={links.all}
            openLabel={dict.nav.openMenu}
            title={dict.nav.menu}
          />
        </div>
      </div>
    </header>
  );
}
