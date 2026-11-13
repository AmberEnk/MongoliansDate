"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textile } from "@/components/textile";
import type { Dictionary } from "@/lib/dictionary";
import type { Product } from "@/lib/demo-data";
import type { Locale } from "@/lib/locales";

export function ProductCard({
  locale,
  product,
  makerName,
  price,
  copy,
}: {
  locale: Locale;
  product: Product;
  makerName: string | null;
  price: string;
  copy: Dictionary["products"];
}) {
  const [open, setOpen] = useState(false);
  const detailId = `${product.id}-detail`;

  return (
    <Card className="h-full bg-card">
      <div className="px-4">
        <div className="aspect-[5/4] overflow-hidden rounded-lg">
          <Textile kind={product.category} />
        </div>
      </div>
      <CardHeader>
        <Badge variant="secondary">{copy.sample}</Badge>
        <CardTitle className="font-display text-2xl leading-tight">
          {product.name[locale]}
        </CardTitle>
        <CardDescription>{product.summary[locale]}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {makerName ? (
          <p className="text-sm text-muted-foreground">
            {copy.by}: {makerName}
          </p>
        ) : null}
        <p className="text-sm">
          <span className="text-muted-foreground">{copy.samplePrice}</span>
          <span className="mt-1 block font-medium text-foreground">{price}</span>
        </p>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-fit bg-background px-3"
          aria-expanded={open}
          aria-controls={detailId}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? copy.hide : copy.details}
        </Button>
        {open ? (
          <p id={detailId} className="text-sm leading-relaxed text-foreground">
            {product.detail[locale]}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
