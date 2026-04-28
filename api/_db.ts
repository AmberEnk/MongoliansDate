import { Pool } from "pg";

let pool: Pool | null = null;

function getConnectionString() {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
}

export function getSql() {
  const connection = getConnectionString();
  if (!connection) {
    throw new Error("Missing POSTGRES_URL (or DATABASE_URL) environment variable.");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: connection,
      max: 5,
    });
  }
  return pool;
}

export async function ensureWaitlistTable(db: Pool) {
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
