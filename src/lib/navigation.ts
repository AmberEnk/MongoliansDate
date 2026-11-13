import type { Locale } from "@/lib/locales";
import type { Dictionary } from "@/lib/dictionary";

export type SiteLink = {
  href: string;
  label: string;
};

export function siteLinks(locale: Locale, dict: Dictionary) {
  const home = `/${locale}`;
  return {
    primary: [
      { href: `${home}#categories`, label: dict.nav.categories },
      { href: `${home}#makers`, label: dict.nav.makers },
      { href: `${home}#materials`, label: dict.nav.materials },
      { href: `${home}/sell`, label: dict.nav.sell },
    ] satisfies SiteLink[],
    all: [
      { href: `${home}#categories`, label: dict.nav.categories },
      { href: `${home}#makers`, label: dict.nav.makers },
      { href: `${home}#products`, label: dict.nav.products },
      { href: `${home}#materials`, label: dict.nav.materials },
      { href: `${home}#craft`, label: dict.nav.craft },
      { href: `${home}#why`, label: dict.nav.why },
      { href: `${home}/sell`, label: dict.nav.sell },
      { href: `${home}#newsletter`, label: dict.nav.newsletter },
    ] satisfies SiteLink[],
  };
}
