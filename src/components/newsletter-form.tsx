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
import { fieldIssue, newsletterSchema } from "@/lib/schemas";

type Values = z.infer<typeof newsletterSchema>;

export function NewsletterForm({
  locale,
  copy,
}: {
  locale: Locale;
  copy: Dictionary["newsletter"];
}) {
  const [phase, setPhase] = useState<"idle" | "loading" | "error">("idle");
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "", locale },
  });

  const emailMessage = fieldIssue(form.formState.errors.email?.message);
  const emailText =
    emailMessage === "empty"
      ? copy.emailEmpty
      : emailMessage === "invalid"
        ? copy.emailInvalid
        : null;

  async function onSubmit(values: Values) {
    setPhase("loading");
    setServerMessage(null);
    try {
      const response = await fetch("/api/newsletter", {
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

  const describedBy =
    emailText || serverMessage ? "newsletter-status" : undefined;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="mt-8 grid gap-3"
    >
      <input type="hidden" {...form.register("locale")} />
      <div className="grid gap-2">
        <Label htmlFor="newsletter-email">{copy.label}</Label>
        <Input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder={copy.placeholder}
          aria-invalid={emailText ? true : undefined}
          aria-describedby={describedBy}
          className="h-11 bg-card px-3 md:text-base"
          {...form.register("email")}
        />
      </div>
      <div id="newsletter-status" aria-live="polite" className="min-h-5 text-sm">
        {emailText ? (
          <p className="text-destructive" role="alert">
            {emailText}
          </p>
        ) : null}
        {serverMessage ? (
          <p className="text-destructive" role="alert">
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
