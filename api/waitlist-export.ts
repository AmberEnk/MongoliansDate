function escapeCsv(value: unknown): string {
  const v = value == null ? "" : String(value);
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

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
    const rows = result.rows;

    const header = ["email", "gender", "country", "city", "age", "created_at"];
    const lines = [header.join(",")];
    for (const row of rows) {
      lines.push(
        [
          row.email,
          row.gender,
          row.country,
          row.city,
          row.age,
          row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
        ]
          .map(escapeCsv)
          .join(",")
      );
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="waitlist-export.csv"');
    return res.status(200).send(lines.join("\n"));
  } catch (error) {
    console.error("waitlist export failed", error);
    return res.status(500).json({ error: "Server error." });
  }
}
