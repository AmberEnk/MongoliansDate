import type { Locale } from "@/lib/locales";

export function formatMnt(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "mn" ? "mn-MN" : "en-US", {
    style: "currency",
    currency: "MNT",
    maximumFractionDigits: 0,
    currencyDisplay: "narrowSymbol",
  }).format(amount);
}
