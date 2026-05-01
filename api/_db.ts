let pool: any = null;

/** Prefer POSTGRES_URL (Vercel Postgres / Neon) or DATABASE_URL. */
export function getDbConnectionString(): string {
  return String(process.env.POSTGRES_URL || process.env.DATABASE_URL || "").trim();
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
    const { Pool } = await import("pg");
    pool = new Pool({
      connectionString: connection,
      max: 1,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 10_000,
      allowExitOnIdle: true,
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
