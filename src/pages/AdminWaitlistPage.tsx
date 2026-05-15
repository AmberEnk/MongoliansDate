import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type Row = {
  email: string;
  gender: string;
  country: string | null;
  city: string | null;
  age: number;
  created_at: string;
};

/** Same trimming as server; strips accidental "Bearer " if pasted into the password field. */
function normalizeBearerSecret(raw: string): string {
  let s = raw.trim();
  if (/^Bearer\s+/i.test(s)) s = s.replace(/^Bearer\s+/i, "").trim();
  return s;
}

export default function AdminWaitlistPage() {
  const { i18n } = useTranslation();
  const [token, setToken] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    meta.setAttribute("data-uchral-admin", "");
    document.head.appendChild(meta);

    const adminTitle = () => {
      document.title = `${i18n.t("adminWaitlist.title")} · ${i18n.t("meta.title")}`;
    };
    adminTitle();
    i18n.on("languageChanged", adminTitle);

    return () => {
      meta.remove();
      i18n.off("languageChanged", adminTitle);
      document.title = i18n.t("meta.title");
    };
  }, [i18n]);

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const row of rows) out[row.gender] = (out[row.gender] || 0) + 1;
    return out;
  }, [rows]);

  async function adminFetchErrorMessage(r: Response, fallback: string): Promise<string> {
    try {
      const text = await r.text();
      try {
        const j = JSON.parse(text) as { error?: string };
        if (j?.error) return `${fallback} (${r.status}: ${j.error})`;
      } catch {
        const snippet = text.slice(0, 160).replace(/\s+/g, " ").trim();
        if (snippet) return `${fallback} (HTTP ${r.status}). ${snippet}`;
      }
    } catch {
      /* ignore */
    }
    return `${fallback} (HTTP ${r.status}).`;
  }

  async function fetchWaitlist(headers: HeadersInit, opts?: { viaDebug?: boolean }) {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/waitlist-admin", { headers });
      if (r.status === 401) {
        setRows([]);
        setError(
          opts?.viaDebug
            ? 'Debug load was refused. Run npx vercel dev with UCHRAL_ADMIN_DEV_BYPASS=1 in .env.local (hits your local DB env). If you only use npm run dev + VITE_DEV_API_ORIGIN, the proxy targets production — production never allows no-token admin.'
            : "Token did not match. In Vercel → Project → Settings → Environment Variables, open WAITLIST_EXPORT_TOKEN and copy only the secret value (not the name), with no quotes or spaces. Redeploy after changing it."
        );
        return;
      }
      if (r.status === 503) {
        setRows([]);
        setError(await adminFetchErrorMessage(r, "Server is missing WAITLIST_EXPORT_TOKEN or misconfigured"));
        return;
      }
      if (!r.ok) {
        setRows([]);
        setError(await adminFetchErrorMessage(r, "Could not load waitlist"));
        return;
      }
      const data = (await r.json()) as { rows?: Row[] };
      setRows(Array.isArray(data.rows) ? data.rows : []);
    } catch {
      setRows([]);
      setError("Could not load waitlist.");
    } finally {
      setLoading(false);
    }
  }

  async function loadRows(e?: FormEvent) {
    e?.preventDefault();
    const secret = normalizeBearerSecret(token);
    if (!secret) {
      setError("Enter admin token.");
      return;
    }
    await fetchWaitlist({ Authorization: `Bearer ${secret}` });
  }

  async function loadRowsDebug() {
    await fetchWaitlist({ "X-Uchral-Admin-Dev": "1" }, { viaDebug: true });
  }

  async function downloadCsv() {
    const secret = normalizeBearerSecret(token);
    if (!secret) {
      setError("Enter admin token first.");
      return;
    }
    setError(null);
    try {
      const r = await fetch("/api/waitlist-export", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (r.status === 401) {
        setError(
          "Token did not match. Copy only the WAITLIST_EXPORT_TOKEN value from Vercel (no name, no quotes)."
        );
        return;
      }
      if (!r.ok) {
        setError(await adminFetchErrorMessage(r, "Could not export CSV"));
        return;
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "waitlist-export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Could not export CSV.");
    }
  }

  return (
    <section className="admin-waitlist">
      <h1>Waitlist Admin</h1>
      <p className="muted">View signups and gender counts.</p>
      <p className="muted">
        Paste the Bearer secret set as WAITLIST_EXPORT_TOKEN on the server. Do not link this page in public
        posts.
      </p>

      <form className="admin-waitlist__auth" onSubmit={loadRows}>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="WAITLIST_EXPORT_TOKEN"
        />
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Loading..." : "Load waitlist"}
        </button>
        {import.meta.env.DEV ? (
          <button type="button" className="btn secondary" disabled={loading} onClick={() => void loadRowsDebug()}>
            Debug: load without token
          </button>
        ) : null}
      </form>

      {import.meta.env.DEV ? (
        <p className="muted admin-waitlist__devhint">
          Debug bypass requires <code>UCHRAL_ADMIN_DEV_BYPASS=1</code> on the process that runs <code>/api/waitlist-admin</code> (e.g.{" "}
          <code>npx vercel dev</code>). It is disabled when <code>VERCEL_ENV=production</code>.
        </p>
      ) : null}

      {error && <p className="err">{error}</p>}

      <div className="admin-waitlist__counts">
        <span>Male: {counts.male || 0}</span>
        <span>Female: {counts.female || 0}</span>
        <span>LGBTQ+: {counts.lgbtq_plus || 0}</span>
        <span>Total: {rows.length}</span>
      </div>

      <button type="button" className="btn secondary" onClick={() => void downloadCsv()}>
        Download CSV
      </button>

      <div className="admin-waitlist__table-wrap">
        <table className="admin-waitlist__table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Gender</th>
              <th>Country</th>
              <th>City</th>
              <th>Age</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.email}-${row.created_at}`}>
                <td>{row.email}</td>
                <td>{row.gender}</td>
                <td>{row.country || "-"}</td>
                <td>{row.city || "-"}</td>
                <td>{row.age}</td>
                <td>{new Date(row.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {!rows.length && !loading && (
              <tr>
                <td colSpan={6} className="muted">
                  No rows loaded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
