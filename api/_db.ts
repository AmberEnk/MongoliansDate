import { getDbConnectionString, isUnsupportedForNodePg } from "../lib/waitlistEnv";

let tcpPool: InstanceType<typeof import("@neondatabase/serverless").Pool> | null = null;
let neonSql: any = null;
let neonBoundUrl: string | null = null;

function shouldUseNeonHttp(url: string): boolean {
  if (!url || isUnsupportedForNodePg(url)) return false;
  const u = url.toLowerCase();
  return u.includes("neon.tech") || u.includes("api.neon.tech");
}

/**
 * Parameterized query: `neon()` (HTTP) on Neon hosts; Neon's `Pool` (TCP/WebSocket) elsewhere — avoids bundling `pg`.
 */
export async function waitlistQuery(text: string, params: unknown[] = []): Promise<{ rows: any[] }> {
  const connection = getDbConnectionString();
  if (!connection) {
    throw new Error("Missing POSTGRES_URL (or DATABASE_URL) environment variable.");
  }

  if (shouldUseNeonHttp(connection)) {
    if (!neonSql || neonBoundUrl !== connection) {
      const { neon } = await import("@neondatabase/serverless");
      neonSql = neon(connection, { fullResults: true });
      neonBoundUrl = connection;
    }
    const result: any = await neonSql(text, params);
    return { rows: result.rows ?? [] };
  }

  if (!tcpPool) {
    const { Pool } = await import("@neondatabase/serverless");
    const low = connection.toLowerCase();
    const ssl =
      low.includes("sslmode=require") ||
      low.includes("supabase.com") ||
      low.includes("pooler.supabase")
        ? { rejectUnauthorized: false }
        : undefined;
    tcpPool = new Pool({
      connectionString: connection,
      max: 1,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 15_000,
      ssl,
    });
  }
  const r = await tcpPool.query(text, params);
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
