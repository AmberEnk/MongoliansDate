/**
 * Vercel Node functions usually parse JSON bodies, but some paths leave
 * `req.body` as a string or Buffer — normalize to a plain object.
 */
export function parseJsonBody(req: { body?: unknown }): Record<string, unknown> {
  const raw = req.body;
  if (raw != null && typeof raw === "object" && !Buffer.isBuffer(raw) && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  let text: string;
  if (Buffer.isBuffer(raw)) text = raw.toString("utf8");
  else if (typeof raw === "string") text = raw;
  else return {};
  try {
    const o = JSON.parse(text) as unknown;
    return o != null && typeof o === "object" && !Array.isArray(o) ? (o as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
