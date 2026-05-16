import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const flags = {
    POSTGRES_URL: Boolean(String(process.env.POSTGRES_URL ?? "").trim()),
    PRISMA_DATABASE_URL: Boolean(String(process.env.PRISMA_DATABASE_URL ?? "").trim()),
    DATABASE_URL: Boolean(String(process.env.DATABASE_URL ?? "").trim()),
  };
  return res.status(200).json({
    ok: true,
    hasDatabaseUrl: Object.values(flags).some(Boolean),
    dbEnvPresence: flags,
  });
}
