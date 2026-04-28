import postgres from "postgres";

const connection = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connection) {
  throw new Error("Missing POSTGRES_URL (or DATABASE_URL) environment variable.");
}

const sql = postgres(connection, {
  ssl: "require",
  max: 5,
});

export async function ensureWaitlistTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS waitlist_entries (
      id BIGSERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      gender TEXT NOT NULL,
      country TEXT,
      city TEXT,
      age INTEGER NOT NULL CHECK (age >= 18 AND age <= 120),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
}

export default sql;
