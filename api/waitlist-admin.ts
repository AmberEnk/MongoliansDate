import type { VercelRequest, VercelResponse } from "@vercel/node";

/** === waitlistEnv (inlined — Vercel omits `./shared/*` from the function ZIP) === */
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

/** === waitlistAuth (inlined) === */
function headerAuthorization(h: Record<string, string | string[] | undefined> | undefined): string {
  if (!h) return "";
  const v = h.authorization ?? h.Authorization;
  const raw = (Array.isArray(v) ? v[0] : v) ?? "";
  return String(raw).trim();
}
function getBearerToken(req: { headers?: Record<string, string | string[] | undefined> }): string {
  const raw = headerAuthorization(req.headers);
  if (/^Bearer\s+/i.test(raw)) return raw.replace(/^Bearer\s+/i, "").trim();
  return raw;
}
function getExpectedWaitlistToken(): string {
  let s = String(process.env.WAITLIST_EXPORT_TOKEN ?? "").trim();
  if (/^Bearer\s+/i.test(s)) s = s.replace(/^Bearer\s+/i, "").trim();
  return s;
}
function waitlistAdminAuthorized(req: { headers?: Record<string, string | string[] | undefined> }): boolean {
  const got = getBearerToken(req);
  const want = getExpectedWaitlistToken();
  return want.length > 0 && got === want;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "Method not allowed." });
    }

    const bypassEnvOk = process.env.UCHRAL_ADMIN_DEV_BYPASS === "1";
    const notVercelProduction = process.env.VERCEL_ENV !== "production";
    const wantsBypass = String(req.headers["x-uchral-admin-dev"] || "") === "1";
    const devBypassOk = bypassEnvOk && notVercelProduction && wantsBypass;

    if (!getExpectedWaitlistToken() && !devBypassOk) {
      return res.status(503).json({ error: "WAITLIST_EXPORT_TOKEN is not set on the server." });
    }

    if (!devBypassOk && !waitlistAdminAuthorized({ headers: req.headers as any })) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    if (!getDbConnectionString()) {
      return res.status(500).json({ error: "Database is not configured." });
    }
    if (isUnsupportedForNodePg(getDbConnectionString())) {
      return res.status(503).json({
        error:
          "Database URL must be direct Postgres (e.g. postgres://…@db.prisma.io/…). Prisma Accelerate (prisma+postgres / prisma://) URLs do not work with this waitlist API.",
      });
    }

    const { ensureWaitlistTable, waitlistQuery } = await import("./waitlistDb");

    await ensureWaitlistTable();

    const { rows } = await waitlistQuery(
      `
      SELECT email, gender, country, city, age, created_at
      FROM waitlist_entries
      ORDER BY created_at DESC
      `
    );

    return res.status(200).json({ rows });
  } catch (error) {
    console.error("waitlist admin fetch failed", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Server error." });
    }
  }
}
