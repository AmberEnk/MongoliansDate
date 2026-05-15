import { getDbConnectionString, isUnsupportedForNodePg } from "../lib/waitlistEnv";

async function parseJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const j = (await request.json()) as unknown;
    return j != null && typeof j === "object" && !Array.isArray(j) ? (j as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const g = globalThis as any;
    const ip =
      String(request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "")
        .split(",")[0]
        ?.trim() || "unknown";
    const now = Date.now();
    const windowMs = 60_000;
    const maxPerWindow = 20;
    if (!g.__uchralWaitlistRateLimit) g.__uchralWaitlistRateLimit = new Map<string, number[]>();
    const hits = (g.__uchralWaitlistRateLimit.get(ip) || []).filter((ts: number) => now - ts < windowMs);
    if (hits.length >= maxPerWindow) {
      return Response.json({ error: "Too many requests. Please try again soon." }, { status: 429 });
    }
    hits.push(now);
    g.__uchralWaitlistRateLimit.set(ip, hits);

    const body = await parseJson(request);
    const email = String(body.email ?? "").trim().toLowerCase();
    const gender = String(body.gender ?? "").trim().toLowerCase();
    const country = String(body.country ?? "").trim();
    const city = String(body.city ?? "").trim();
    const age = Number(body.age);

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validText = /^[a-zA-Z0-9 \u0080-\uFFFF]*$/;
    const allowedGenders = new Set(["male", "female", "lgbtq_plus"]);
    if (!validEmail) return Response.json({ error: "Invalid email." }, { status: 400 });
    if (!allowedGenders.has(gender)) return Response.json({ error: "Invalid gender." }, { status: 400 });
    if ((country && !validText.test(country)) || (city && !validText.test(city))) {
      return Response.json({ error: "Country/city must be letters, numbers, or spaces." }, { status: 400 });
    }
    if (!Number.isInteger(age) || age < 18 || age > 120) {
      return Response.json({ error: "Invalid age." }, { status: 400 });
    }

    if (!getDbConnectionString()) {
      return Response.json({ error: "Database is not configured." }, { status: 500 });
    }
    if (isUnsupportedForNodePg(getDbConnectionString())) {
      return Response.json(
        {
          error:
            "POSTGRES_URL must be a direct Postgres connection (e.g. neon.tech, pooler.supabase.com). Prisma Accelerate / prisma.io proxy URLs do not work with this waitlist API.",
        },
        { status: 503 }
      );
    }

    const { ensureWaitlistTable, waitlistQuery } = await import("./_db");

    await ensureWaitlistTable();

    await waitlistQuery(
      `
      INSERT INTO waitlist_entries (email, gender, country, city, age)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [email, gender, country || null, city || null, age]
    );

    return Response.json({ ok: true }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "23505") {
      return Response.json({ error: "Email already exists." }, { status: 409 });
    }
    console.error("waitlist failed", error);
    return Response.json({ error: "Server error." }, { status: 500 });
  }
}
