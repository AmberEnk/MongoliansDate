import type { VercelRequest, VercelResponse } from "@vercel/node";

/** === waitlistEnv (inlined) === */
function connectionCandidates(): string[] {
  return [
    process.env.POSTGRES_URL,
    process.env.PRISMA_DATABASE_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.DIRECT_URL,
    process.env.DATABASE_URL,
  ]
    .map((s) => String(s ?? "").trim())
    .filter((s) => s.length > 0);
}
function getDbConnectionString(): string {
  const list = connectionCandidates();
  const direct = list.find((u) => !isUnsupportedForNodePg(u));
  if (direct) return direct;
  return list[0] ?? "";
}
function isUnsupportedForNodePg(url: string): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  if (u.startsWith("prisma+postgres:") || u.startsWith("prisma://")) return true;
  return u.includes("prisma-data.net") || u.includes("prisma-data.in") || u.includes("accelerate.prisma");
}

/** === parseJsonBody (inlined) === */
function parseJsonBody(req: { body?: unknown }): Record<string, unknown> {
  const raw = req.body;
  if (raw != null && typeof raw === "object" && !Buffer.isBuffer(raw) && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  let text: string;
  if (Buffer.isBuffer(raw)) text = raw.toString("utf8");
  else if (typeof raw === "string") text = raw;
  else return {};
  try {
    const o = JSON.parse(text) as unknown;
    return o != null && typeof o === "object" && !Array.isArray(o) ? (o as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

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
