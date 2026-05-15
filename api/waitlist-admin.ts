import { getExpectedWaitlistToken, waitlistAdminAuthorizedRequest } from "./_waitlistAuth";
import { getDbConnectionString, isUnsupportedForNodePg } from "./_waitlistEnv";

export async function GET(request: Request): Promise<Response> {
  try {
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

    return Response.json({ rows });
  } catch (error) {
    console.error("waitlist admin fetch failed", error);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}
