import sql, { ensureWaitlistTable } from "./_db";

function send(res: any, status: number, body: Record<string, unknown>) {
  res.status(status).json(body);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { error: "Method not allowed." });
  }

  try {
    await ensureWaitlistTable();

    const email = String(req.body?.email || "").trim().toLowerCase();
    const gender = String(req.body?.gender || "").trim().toLowerCase();
    const country = String(req.body?.country || "").trim();
    const city = String(req.body?.city || "").trim();
    const age = Number(req.body?.age);

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const allowedGenders = new Set(["male", "female", "lgbtq_plus"]);

    if (!validEmail) {
      return send(res, 400, { error: "Invalid email." });
    }
    if (!allowedGenders.has(gender)) {
      return send(res, 400, { error: "Invalid gender." });
    }
    if (!Number.isInteger(age) || age < 18 || age > 120) {
      return send(res, 400, { error: "Invalid age." });
    }

    await sql`
      INSERT INTO waitlist_entries (email, gender, country, city, age)
      VALUES (${email}, ${gender}, ${country || null}, ${city || null}, ${age})
    `;

    return send(res, 201, { ok: true });
  } catch (error: any) {
    if (error?.code === "23505") {
      return send(res, 409, { error: "Email already exists." });
    }
    console.error("waitlist insert failed", error);
    return send(res, 500, { error: "Server error." });
  }
}
