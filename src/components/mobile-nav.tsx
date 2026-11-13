"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { SiteLink } from "@/lib/navigation";

export function MobileNav({
  links,
  openLabel,
  title,
}: {
  links: SiteLink[];
  openLabel: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            aria-label={openLabel}
            className="bg-card"
          />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="right" className="bg-background">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">{title}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-3 text-base text-foreground hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
