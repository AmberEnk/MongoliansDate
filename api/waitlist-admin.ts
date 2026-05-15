import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getExpectedWaitlistToken, waitlistAdminAuthorized } from "./_lib/waitlistAuth";
import { getDbConnectionString, isUnsupportedForNodePg } from "./_lib/waitlistEnv";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "Method not allowed." });
    }

    if (!getExpectedWaitlistToken()) {
      return res.status(503).json({ error: "WAITLIST_EXPORT_TOKEN is not set on the server." });
    }

    if (!waitlistAdminAuthorized({ headers: req.headers as any })) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    if (!getDbConnectionString()) {
      return res.status(500).json({ error: "Database is not configured." });
    }
    if (isUnsupportedForNodePg(getDbConnectionString())) {
      return res.status(503).json({
        error:
          "POSTGRES_URL must be a direct Postgres connection. Prisma Accelerate / prisma.io URLs do not work with this waitlist API.",
      });
    }

    const { ensureWaitlistTable, waitlistQuery } = await import("./_db");

    await ensureWaitlistTable();

    const { rows } = await waitlistQuery(
      `
      SELECT email, gender, country, city, age, created_at
      FROM waitlist_entries
      ORDER BY created_at DESC
      `
    );

    return res.status(200).json({ rows });
  } catch (error) {
    console.error("waitlist admin fetch failed", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Server error." });
    }
  }
}
