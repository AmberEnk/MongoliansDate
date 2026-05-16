import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getExpectedWaitlistToken, waitlistAdminAuthorized } from "./shared/waitlistAuth";
import { getDbConnectionString, isUnsupportedForNodePg } from "./shared/waitlistEnv";

function escapeCsv(value: unknown): string {
  const v = value == null ? "" : String(value);
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

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
          "Database URL must be direct Postgres (e.g. postgres://…@db.prisma.io/…). Prisma Accelerate (prisma+postgres / prisma://) URLs do not work with this waitlist API.",
      });
    }

    const { ensureWaitlistTable, waitlistQuery } = await import("./waitlistDb");

    await ensureWaitlistTable();

    const { rows } = await waitlistQuery(
      `
      SELECT email, gender, country, city, age, created_at
      FROM waitlist_entries
      ORDER BY created_at DESC
      `
    );

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
    if (!res.headersSent) {
      return res.status(500).json({ error: "Server error." });
    }
  }
}
