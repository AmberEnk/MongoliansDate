import { z } from "zod";

const localeField = z.enum(["mn", "en"]);

function requiredText(max: number) {
  return z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value.length === 0) {
        ctx.addIssue({ code: "custom", message: "empty" });
        return;
      }
      if (value.length > max) {
        ctx.addIssue({ code: "custom", message: "invalid" });
      }
    });
}

const emailField = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    if (value.length === 0) {
      ctx.addIssue({ code: "custom", message: "empty" });
      return;
    }
    if (value.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      ctx.addIssue({ code: "custom", message: "invalid" });
    }
  });

export const newsletterSchema = z.object({
  email: emailField,
  locale: localeField,
});

export const sellerInterestSchema = z.object({
  name: requiredText(80),
  email: emailField,
  city: requiredText(80),
  craft: requiredText(120),
  locale: localeField,
});

export type FieldIssue = "empty" | "invalid";

export function fieldIssue(message: string | undefined): FieldIssue | null {
  if (message === "empty" || message === "invalid") return message;
  return message ? "invalid" : null;
}
