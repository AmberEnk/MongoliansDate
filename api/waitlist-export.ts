import { getExpectedWaitlistToken, waitlistAdminAuthorizedRequest } from "./_waitlistAuth";
import { getDbConnectionString, isUnsupportedForNodePg } from "./waitlistEnv";

function escapeCsv(value: unknown): string {
  const v = value == null ? "" : String(value);
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export default {
  async fetch(request: Request): Promise<Response> {
    try {
      if (request.method !== "GET") {
        return Response.json({ error: "Method not allowed." }, {
          status: 405,
          headers: { Allow: "GET" },
        });
      }

      if (!getExpectedWaitlistToken()) {
        return Response.json({ error: "WAITLIST_EXPORT_TOKEN is not set on the server." }, { status: 503 });
      }

      if (!waitlistAdminAuthorizedRequest(request)) {
        return Response.json({ error: "Unauthorized." }, { status: 401 });
      }

      if (!getDbConnectionString()) {
        return Response.json({ error: "Database is not configured." }, { status: 500 });
      }
      if (isUnsupportedForNodePg(getDbConnectionString())) {
        return Response.json(
          {
            error:
              "POSTGRES_URL must be a direct Postgres connection. Prisma Accelerate / prisma.io URLs do not work with this waitlist API.",
          },
          { status: 503 }
        );
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

      const body = lines.join("\n");
      return new Response(body, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="waitlist-export.csv"',
        },
      });
    } catch (error) {
      console.error("waitlist export failed", error);
      return Response.json({ error: "Server error." }, { status: 500 });
    }
  },
};
