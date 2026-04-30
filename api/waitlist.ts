export default async function handler(req: any, res: any) {
  const g = globalThis as any;
  const ip = String(req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown");
  const now = Date.now();
  const windowMs = 60_000;
  const maxPerWindow = 20;
  if (!g.__uchralWaitlistRateLimit) g.__uchralWaitlistRateLimit = new Map<string, number[]>();
  const hits = (g.__uchralWaitlistRateLimit.get(ip) || []).filter((ts: number) => now - ts < windowMs);
  if (hits.length >= maxPerWindow) {
    return res.status(429).json({ error: "Too many requests. Please try again soon." });
  }
  hits.push(now);
  g.__uchralWaitlistRateLimit.set(ip, hits);

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const gender = String(req.body?.gender || "").trim().toLowerCase();
    const country = String(req.body?.country || "").trim();
    const city = String(req.body?.city || "").trim();
    const age = Number(req.body?.age);

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validText = /^[\p{L}\p{N} ]*$/u;
    const allowedGenders = new Set(["male", "female", "lgbtq_plus"]);
    if (!validEmail) return res.status(400).json({ error: "Invalid email." });
    if (!allowedGenders.has(gender)) return res.status(400).json({ error: "Invalid gender." });
    if ((country && !validText.test(country)) || (city && !validText.test(city))) {
      return res.status(400).json({ error: "Country/city must be alphanumeric." });
    }
    if (!Number.isInteger(age) || age < 18 || age > 120) {
      return res.status(400).json({ error: "Invalid age." });
    }

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

    await db.query(
      `
      INSERT INTO waitlist_entries (email, gender, country, city, age)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [email, gender, country || null, city || null, age]
    );

    return res.status(201).json({ ok: true });
  } catch (error: any) {
    if (error?.code === "23505") {
      return res.status(409).json({ error: "Email already exists." });
    }
    console.error("waitlist insert failed", error);
    return res.status(500).json({ error: "Server error." });
  }
}
