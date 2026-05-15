/** Sanity check: `/api/waitlist-health` should return JSON (not Vercel FUNCTION_INVOCATION_FAILED). */
import { getDbConnectionString } from "../lib/waitlistEnv";

export function GET() {
  return Response.json({
    ok: true,
    hasDatabaseUrl: getDbConnectionString().length > 0,
  });
}
