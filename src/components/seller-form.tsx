"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/locales";
import { fieldIssue, sellerInterestSchema } from "@/lib/schemas";

type Values = z.infer<typeof sellerInterestSchema>;

export function SellerForm({
  locale,
  copy,
}: {
  locale: Locale;
  copy: Dictionary["sell"];
}) {
  const [phase, setPhase] = useState<"idle" | "loading" | "error">("idle");
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(sellerInterestSchema),
    defaultValues: { name: "", email: "", city: "", craft: "", locale },
  });

  const errors = form.formState.errors;

  function messageFor(issue: ReturnType<typeof fieldIssue>, empty: string, invalid: string) {
    if (issue === "empty") return empty;
    if (issue === "invalid") return invalid;
    return null;
  }

  const fields = [
    {
      name: "name" as const,
      label: copy.name,
      autoComplete: "name",
      message: messageFor(fieldIssue(errors.name?.message), copy.nameEmpty, copy.invalid),
    },
    {
      name: "email" as const,
      label: copy.email,
      autoComplete: "email",
      type: "email",
      message: messageFor(
        fieldIssue(errors.email?.message),
        copy.emailEmpty,
        copy.emailInvalid,
      ),
    },
    {
      name: "city" as const,
      label: copy.city,
      autoComplete: "address-level2",
      message: messageFor(fieldIssue(errors.city?.message), copy.cityEmpty, copy.invalid),
    },
    {
      name: "craft" as const,
      label: copy.craft,
      autoComplete: "off",
      message: messageFor(fieldIssue(errors.craft?.message), copy.craftEmpty, copy.invalid),
    },
  ];

  async function onSubmit(values: Values) {
    setPhase("loading");
    setServerMessage(null);
    try {
      const response = await fetch("/api/seller-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await response.json().catch(() => null)) as {
        code?: string;
      } | null;
      setPhase("error");
      if (payload?.code === "not_available") setServerMessage(copy.unavailable);
      else if (payload?.code === "invalid") setServerMessage(copy.invalid);
      else setServerMessage(copy.network);
    } catch {
      setPhase("error");
      setServerMessage(copy.network);
    }
  }

  return (
    <form
      id="interest"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="scroll-mt-28 grid gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6"
    >
      <input type="hidden" {...form.register("locale")} />
      {fields.map((field) => (
        <div key={field.name} className="grid gap-2">
          <Label htmlFor={`seller-${field.name}`}>{field.label}</Label>
          <Input
            id={`seller-${field.name}`}
            type={field.type ?? "text"}
            autoComplete={field.autoComplete}
            aria-invalid={field.message ? true : undefined}
            aria-describedby={
              field.message ? `seller-${field.name}-error` : undefined
            }
            className="h-11 bg-background px-3 md:text-base"
            {...form.register(field.name)}
          />
          {field.message ? (
            <p
              id={`seller-${field.name}-error`}
              role="alert"
              className="text-sm text-destructive"
            >
              {field.message}
            </p>
          ) : null}
        </div>
      ))}
      <div aria-live="polite">
        {serverMessage ? (
          <p role="alert" className="text-sm text-destructive">
            {serverMessage}
          </p>
        ) : null}
      </div>
      <Button
        type="submit"
        size="lg"
        className="h-11 w-fit px-5"
        disabled={phase === "loading"}
      >
        {phase === "loading" ? copy.sending : copy.submit}
      </Button>
    </form>
  );
}
