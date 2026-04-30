export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const expected = process.env.WAITLIST_EXPORT_TOKEN;

  if (!expected || token !== expected) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  try {
    const connection = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!connection) {
      return res.status(500).json({ error: "Database is not configured." });
    }

    const { Pool } = await import("pg");
    const g = globalThis as any;
    if (!g.__uchralWaitlistPool) {
      g.__uchralWaitlistPool = new Pool({
        connectionString: connection,
        max: 5,
      });
    }
    const db = g.__uchralWaitlistPool as any;

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

    const result = await db.query(
      `
      SELECT email, gender, country, city, age, created_at
      FROM waitlist_entries
      ORDER BY created_at DESC
      `
    );

    return res.status(200).json({ rows: result.rows });
  } catch (error) {
    console.error("waitlist admin fetch failed", error);
    return res.status(500).json({ error: "Server error." });
  }
}
