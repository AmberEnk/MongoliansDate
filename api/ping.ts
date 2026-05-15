import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDbConnectionString } from "./_lib/waitlistEnv";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ ok: true, hasDatabaseUrl: getDbConnectionString().length > 0 });
}
