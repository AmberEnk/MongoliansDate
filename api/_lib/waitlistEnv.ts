/** Env-only helpers (no DB drivers). Under `api/_lib/` so Vercel bundles them with functions (parent `../lib` often is omitted). */

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

/**
 * First direct Postgres URL in priority order (Vercel / Neon / Prisma conventions).
 * Skips Prisma Accelerate / Data Proxy URLs when a direct URL exists.
 */
export function getDbConnectionString(): string {
  const list = connectionCandidates();
  const direct = list.find((u) => !isUnsupportedForNodePg(u));
  if (direct) return direct;
  return list[0] ?? "";
}

/**
 * Prisma **Accelerate** / proxy-style URLs are not Postgres wire protocol here.
 * Prisma **Postgres** (`db.prisma.io`) is normal Postgres over TLS — allowed.
 */
export function isUnsupportedForNodePg(url: string): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  if (u.startsWith("prisma+postgres:") || u.startsWith("prisma://")) {
    return true;
  }
  return u.includes("prisma-data.net") || u.includes("prisma-data.in") || u.includes("accelerate.prisma");
}
