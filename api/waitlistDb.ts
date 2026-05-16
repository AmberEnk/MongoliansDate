/**
 * Postgres access for waitlist endpoints only.
 *
 * Former `waitlistEnv` helpers live here too so this file does not depend on
 * `./shared/*` — Vercel’s multi-file lambdas omit those sibling modules from the ZIP.
 */

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

function isUnsupportedForNodePg(url: string): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  if (u.startsWith("prisma+postgres:") || u.startsWith("prisma://")) {
    return true;
  }
  return u.includes("prisma-data.net") || u.includes("prisma-data.in") || u.includes("accelerate.prisma");
}

function getDbConnectionString(): string {
  const list = connectionCandidates();
  const direct = list.find((u) => !isUnsupportedForNodePg(u));
  if (direct) return direct;
  return list[0] ?? "";
}

/** Deferred: avoid static literal `import("pg"/neon)` — esbuild may inline drivers into unrelated routes. */
let pgPool: any = null;
let neonSql: any = null;
let neonBoundUrl: string | null = null;

function shouldUseNeonHttp(url: string): boolean {
  if (!url || isUnsupportedForNodePg(url)) return false;
  if (String(process.env.UCHRAL_USE_NEON_HTTP || "").trim() === "1") return true;
  const u = url.toLowerCase();
  return u.includes("neon.tech") || u.includes("api.neon.tech") || u.includes(".neon.build");
}

async function importPgModule(): Promise<typeof import("pg")> {
  const spec = "pg";
  return import(spec);
}

async function importNeonModule(): Promise<typeof import("@neondatabase/serverless")> {
  const spec = "@neondatabase/serverless";
  return import(spec);
}

export async function waitlistQuery(text: string, params: unknown[] = []): Promise<{ rows: any[] }> {
  const connection = getDbConnectionString();
  if (!connection) {
    throw new Error("Missing POSTGRES_URL (or DATABASE_URL) environment variable.");
  }

  if (shouldUseNeonHttp(connection)) {
    if (!neonSql || neonBoundUrl !== connection) {
      const { neon } = await importNeonModule();
      neonSql = neon(connection, { fullResults: true });
      neonBoundUrl = connection;
    }
    const result: any = await neonSql(text, params);
    return { rows: result.rows ?? [] };
  }

  if (!pgPool) {
    const { Pool } = await importPgModule();
    const low = connection.toLowerCase();
    const ssl =
      low.includes("sslmode=require") ||
      low.includes("supabase.com") ||
      low.includes("pooler.supabase") ||
      low.includes("db.prisma.io")
        ? { rejectUnauthorized: false }
        : undefined;
    pgPool = new Pool({
      connectionString: connection,
      max: 1,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 15_000,
      ssl,
    });
  }
  const r = await pgPool.query(text, params);
  return { rows: r.rows };
}

export async function ensureWaitlistTable() {
  await waitlistQuery(
    `
    CREATE TABLE IF NOT EXISTS waitlist_entries (
      id BIGSERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      gender TEXT NOT NULL,
      country TEXT,
      city TEXT,
      age INTEGER NOT NULL CHECK (age >= 18 AND age <= 120),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `,
    []
  );
}
