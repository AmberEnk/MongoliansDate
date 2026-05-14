import { Pool } from "pg";

let pool: Pool | null = null;

/** Prefer POSTGRES_URL (Vercel Postgres / Neon) or DATABASE_URL. */
export function getDbConnectionString(): string {
  return String(process.env.POSTGRES_URL || process.env.DATABASE_URL || "").trim();
}

/**
 * Prisma Accelerate / Data Proxy hosts are not Postgres wire protocol — `pg` will fail at runtime.
 * Use a direct connection string from Neon, Supabase, Vercel Postgres, etc.
 */
export function isUnsupportedForNodePg(url: string): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  return u.includes("prisma.io") || u.includes("prisma-data.net") || u.includes("accelerate.prisma");
}

/**
 * Shared pool for waitlist API routes. Tuned for Vercel serverless: low max
 * avoids exhausting provider connection limits; idle timeout releases sockets.
 */
export async function getSql() {
  const connection = getDbConnectionString();
  if (!connection) {
    throw new Error("Missing POSTGRES_URL (or DATABASE_URL) environment variable.");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: connection,
      max: 1,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return pool;
}

export async function ensureWaitlistTable(db: any) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS waitlist_entries (
      id BIGSERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      gender TEXT NOT NULL,
      country TEXT,
      city TEXT,
      age INTEGER NOT NULL CHECK (age >= 18 AND age <= 120),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}
