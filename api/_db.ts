let pool: any = null;

function getConnectionString() {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
}

export async function getSql() {
  const connection = getConnectionString();
  if (!connection) {
    throw new Error("Missing POSTGRES_URL (or DATABASE_URL) environment variable.");
  }
  if (!pool) {
    const { Pool } = await import("pg");
    pool = new Pool({
      connectionString: connection,
      max: 5,
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
