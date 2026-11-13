import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { ProductCard } from "@/components/product-card";
import { Meander, Textile } from "@/components/textile";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { categoryIds, featuredMakers, makerById, products } from "@/lib/demo-data";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/locales";
import { formatMnt } from "@/lib/money";
import { cn } from "cn";

export function HomePage({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const makers = featuredMakers();

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 md:grid-cols-12 md:py-24">
        <div className="md:col-span-7">
          <p className="text-xs tracking-[0.22em] text-clay uppercase">
            {dict.hero.eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.02] tracking-tight text-balance md:text-7xl">
            {dict.hero.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {dict.hero.lede}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}#categories`}
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}
            >
              {dict.hero.primary}
            </Link>
            <Link
              href={`/${locale}/sell`}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 bg-card px-5",
              )}
            >
              {dict.hero.secondary}
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">{dict.hero.note}</p>
        </div>
        <div className="md:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary">
            <Textile kind="cashmere" className="absolute inset-0" />
            <div className="absolute inset-5 border border-wool/25" />
            <p className="absolute top-8 left-8 text-xs tracking-[0.18em] text-wool uppercase">
              {dict.products.sample} · {dict.categories.items.cashmere.name}
            </p>
            <div className="absolute right-8 bottom-8 left-8">
              <Meander />
            </div>
          </div>
        </div>
      </section>

      <section
        id="categories"
        className="scroll-mt-24 border-t border-border"
      >
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
          <SectionIntro title={dict.categories.title} lede={dict.categories.lede} />
          <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {categoryIds.map((id) => {
              const item = dict.categories.items[id];
              return (
                <li key={id}>
                  <article className="h-full overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
                    <div className="aspect-[5/4]">
                      <Textile kind={id} />
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-2xl leading-none">
                        {item.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.text}
                      </p>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section id="makers" className="scroll-mt-24 border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
          <SectionIntro title={dict.makers.title} lede={dict.makers.lede} />
          {makers.length === 0 ? (
            <p className="mt-10 text-muted-foreground">{dict.makers.empty}</p>
          ) : (
            <ul className="mt-12 grid gap-4 sm:grid-cols-2">
              {makers.map((maker) => (
                <li key={maker.id}>
                  <Card className="h-full bg-card">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <p
                          aria-hidden="true"
                          className="flex size-12 items-center justify-center rounded-full bg-secondary font-display text-xl text-wool"
                        >
                          {maker.name[locale].slice(0, 1)}
                        </p>
                        <Badge variant="secondary">{dict.makers.sample}</Badge>
                      </div>
                      <CardTitle className="font-display text-3xl">
                        {maker.name[locale]}
                      </CardTitle>
                      <CardDescription>
                        {dict.makers.city} · {dict.categories.items[maker.category].name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="leading-relaxed">{maker.text[locale]}</p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section id="products" className="scroll-mt-24 border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
          <SectionIntro title={dict.products.title} lede={dict.products.lede} />
          {products.length === 0 ? (
            <p className="mt-10 text-muted-foreground">{dict.products.empty}</p>
          ) : (
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => {
                const maker = makerById(product.makerId);
                return (
                  <li key={product.id}>
                    <ProductCard
                      locale={locale}
                      product={product}
                      makerName={maker ? maker.name[locale] : null}
                      price={formatMnt(product.priceMnt, locale)}
                      copy={dict.products}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section id="materials" className="scroll-mt-24 border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-2 md:py-28">
          <div>
            <SectionIntro title={dict.materials.title} lede={dict.materials.lede} />
            <div className="mt-10 grid gap-8">
              <article>
                <h3 className="font-display text-3xl">{dict.materials.cashmereTitle}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {dict.materials.cashmere}
                </p>
              </article>
              <article>
                <h3 className="font-display text-3xl">{dict.materials.woolTitle}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {dict.materials.wool}
                </p>
              </article>
              <p className="text-sm text-foreground">{dict.materials.note}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] overflow-hidden rounded-2xl">
              <Textile kind="cashmere" />
            </div>
            <div className="mt-10 aspect-[3/4] overflow-hidden rounded-2xl">
              <Textile kind="wool" />
            </div>
          </div>
        </div>
      </section>

      <section id="craft" className="scroll-mt-24 border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
          <SectionIntro title={dict.craft.title} lede={dict.craft.lede} />
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {dict.craft.points.map((point, index) => (
              <li key={point.title} className="border-t border-border pt-6">
                <p className="text-xs tracking-[0.18em] text-clay">
                  0{index + 1}
                </p>
                <h3 className="mt-3 font-display text-3xl">{point.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {point.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="why" className="scroll-mt-24 border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
          <SectionIntro title={dict.why.title} lede={dict.why.lede} />
          <ol className="mt-12 divide-y divide-border border-y border-border">
            {dict.why.points.map((point, index) => (
              <li
                key={point.title}
                className="grid gap-3 py-7 md:grid-cols-[8rem_1fr] md:gap-8"
              >
                <p className="font-display text-3xl text-clay">0{index + 1}</p>
                <div>
                  <h3 className="font-display text-3xl">{point.title}</h3>
                  <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
                    {point.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="sell" className="scroll-mt-24 border-t border-border bg-secondary/50">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-[1.2fr_0.8fr] md:py-28">
          <div>
            <p className="text-xs tracking-[0.22em] text-clay uppercase">
              {dict.sell.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-4xl tracking-tight text-balance md:text-5xl">
              {dict.sell.title}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {dict.sell.lede}
            </p>
            <ul className="mt-8 grid max-w-xl gap-3 text-sm leading-relaxed">
              {dict.sell.points.map((point) => (
                <li key={point} className="border-l-2 border-clay pl-4">
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-end">
            <Link
              href={`/${locale}/sell#interest`}
              className={cn(buttonVariants({ size: "lg" }), "h-11 px-5")}
            >
              {dict.sell.cta}
            </Link>
          </div>
        </div>
      </section>

      <section id="newsletter" className="scroll-mt-24 border-t border-border">
        <div className="mx-auto max-w-xl px-5 py-20 sm:px-8 md:py-28">
          <h2 className="font-display text-4xl tracking-tight md:text-5xl">
            {dict.newsletter.title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {dict.newsletter.lede}
          </p>
          <NewsletterForm locale={locale} copy={dict.newsletter} />
        </div>
      </section>
    </div>
  );
}

function SectionIntro({ title, lede }: { title: string; lede: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-4xl tracking-tight text-balance md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{lede}</p>
    </div>
  );
}
