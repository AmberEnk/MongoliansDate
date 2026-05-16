import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDbConnectionString, isUnsupportedForNodePg } from "./shared/waitlistEnv";
import { parseJsonBody } from "./parseJsonBody";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const g = globalThis as any;
    const ip =
      String(req.headers?.["x-forwarded-for"] ?? req.headers?.["x-real-ip"] ?? "")
        .split(",")[0]
        ?.trim() || "unknown";
    const now = Date.now();
    const windowMs = 60_000;
    const maxPerWindow = 20;
    if (!g.__uchralWaitlistRateLimit) g.__uchralWaitlistRateLimit = new Map<string, number[]>();
    const hits = (g.__uchralWaitlistRateLimit.get(ip) || []).filter((ts: number) => now - ts < windowMs);
    if (hits.length >= maxPerWindow) {
      return res.status(429).json({ error: "Too many requests. Please try again soon." });
    }
    hits.push(now);
    g.__uchralWaitlistRateLimit.set(ip, hits);

    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed." });
    }

    const body = parseJsonBody(req);
    const email = String(body.email ?? "").trim().toLowerCase();
    const gender = String(body.gender ?? "").trim().toLowerCase();
    const country = String(body.country ?? "").trim();
    const city = String(body.city ?? "").trim();
    const age = Number(body.age);

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validText = /^[\p{L}\p{N} ]*$/u;
    const allowedGenders = new Set(["male", "female", "lgbtq_plus"]);
    if (!validEmail) return res.status(400).json({ error: "Invalid email." });
    if (!allowedGenders.has(gender)) return res.status(400).json({ error: "Invalid gender." });
    if ((country && !validText.test(country)) || (city && !validText.test(city))) {
      return res.status(400).json({ error: "Country/city must be alphanumeric." });
    }
    if (!Number.isInteger(age) || age < 18 || age > 120) {
      return res.status(400).json({ error: "Invalid age." });
    }

    if (!getDbConnectionString()) {
      return res.status(500).json({ error: "Database is not configured." });
    }
    if (isUnsupportedForNodePg(getDbConnectionString())) {
      return res.status(503).json({
        error:
          "Database URL must be direct Postgres (e.g. postgres://…@db.prisma.io/…, Neon, Supabase). Prisma Accelerate prisma+postgres / prisma:// proxy URLs do not work with this API.",
      });
    }

    const { ensureWaitlistTable, waitlistQuery } = await import("./waitlistDb");

    await ensureWaitlistTable();

    await waitlistQuery(
      `
      INSERT INTO waitlist_entries (email, gender, country, city, age)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [email, gender, country || null, city || null, age]
    );

    return res.status(201).json({ ok: true });
  } catch (error: any) {
    if (error?.code === "23505") {
      return res.status(409).json({ error: "Email already exists." });
    }
    console.error("waitlist failed", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Server error." });
    }
  }
}
