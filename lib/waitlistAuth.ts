/** Normalize Bearer token and env secret (Vercel / copy-paste often adds trailing newlines). */
function headerAuthorization(
  h: Record<string, string | string[] | undefined> | undefined
): string {
  if (!h) return "";
  const v = h.authorization ?? h.Authorization;
  const raw = (Array.isArray(v) ? v[0] : v) ?? "";
  return String(raw).trim();
}

export function getBearerToken(req: { headers?: Record<string, string | string[] | undefined> }): string {
  const raw = headerAuthorization(req.headers);
  if (/^Bearer\s+/i.test(raw)) return raw.replace(/^Bearer\s+/i, "").trim();
  return raw;
}

export function getBearerTokenFromRequest(request: Request): string {
  const raw =
    request.headers.get("authorization") ?? request.headers.get("Authorization") ?? "";
  return getBearerToken({ headers: { authorization: raw } });
}

export function getExpectedWaitlistToken(): string {
  let s = String(process.env.WAITLIST_EXPORT_TOKEN ?? "").trim();
  if (/^Bearer\s+/i.test(s)) s = s.replace(/^Bearer\s+/i, "").trim();
  return s;
}

export function waitlistAdminAuthorized(req: { headers?: Record<string, string | string[] | undefined> }): boolean {
  const got = getBearerToken(req);
  const want = getExpectedWaitlistToken();
  return want.length > 0 && got === want;
}

export function waitlistAdminAuthorizedRequest(request: Request): boolean {
  const got = getBearerTokenFromRequest(request);
  const want = getExpectedWaitlistToken();
  return want.length > 0 && got === want;
}
