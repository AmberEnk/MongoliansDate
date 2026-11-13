import Link from "next/link";
import { cn } from "cn";
import type { Locale } from "@/lib/locales";

export function Logo({
  locale,
  label,
  className,
}: {
  locale: Locale;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={`/${locale}`}
      aria-label={label}
      className={cn("block min-w-0", className)}
    >
      <span className="font-display block text-[1.35rem] leading-none tracking-tight text-foreground">
        Mongolian Makers
      </span>
      <span className="mt-1 block text-[0.62rem] tracking-[0.32em] text-clay">
        MARKET
      </span>
    </Link>
  );
}
