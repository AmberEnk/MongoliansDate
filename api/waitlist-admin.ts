import { ensureWaitlistTable, getDbConnectionString, getSql, isUnsupportedForNodePg } from "./_db";
import { getExpectedWaitlistToken, waitlistAdminAuthorized } from "./_waitlistAuth";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!getExpectedWaitlistToken()) {
    return res.status(503).json({ error: "WAITLIST_EXPORT_TOKEN is not set on the server." });
  }

  if (!waitlistAdminAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  try {
    if (!getDbConnectionString()) {
      return res.status(500).json({ error: "Database is not configured." });
    }
    if (isUnsupportedForNodePg(getDbConnectionString())) {
      return res.status(503).json({
        error:
          "POSTGRES_URL must be a direct Postgres connection. Prisma Accelerate / prisma.io URLs do not work with this waitlist API.",
      });
    }

    const db = await getSql();
    await ensureWaitlistTable(db);

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
