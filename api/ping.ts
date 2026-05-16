import type { VercelRequest, VercelResponse } from "@vercel/node";

/** Inline env probes only — avoids importing shared DB helpers so `/api/ping` stays a minimal health probe. */
function dbEnvPresence(): Record<string, boolean> {
  const s = (k: keyof NodeJS.ProcessEnv) => Boolean(String(process.env[k] ?? "").trim());
  return {
    POSTGRES_URL: s("POSTGRES_URL"),
    PRISMA_DATABASE_URL: s("PRISMA_DATABASE_URL"),
    DATABASE_URL: s("DATABASE_URL"),
    POSTGRES_URL_NON_POOLING: s("POSTGRES_URL_NON_POOLING"),
    DATABASE_URL_UNPOOLED: s("DATABASE_URL_UNPOOLED"),
  };
}

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const flags = dbEnvPresence();
  return res.status(200).json({
    ok: true,
    hasDatabaseUrl: Object.values(flags).some(Boolean),
    dbEnvPresence: flags,
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
}
