import { FormEvent, useMemo, useState } from "react";

type Row = {
  email: string;
  gender: string;
  country: string | null;
  city: string | null;
  age: number;
  created_at: string;
};

export default function AdminWaitlistPage() {
  const [token, setToken] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const row of rows) out[row.gender] = (out[row.gender] || 0) + 1;
    return out;
  }, [rows]);

  async function loadRows(e?: FormEvent) {
    e?.preventDefault();
    if (!token.trim()) {
      setError("Enter admin token.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/waitlist-admin", {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      if (r.status === 401) {
        setRows([]);
        setError("Invalid token.");
        return;
      }
      if (!r.ok) {
        setRows([]);
        setError("Could not load waitlist.");
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

  async function downloadCsv() {
    if (!token.trim()) {
      setError("Enter admin token first.");
      return;
    }
    setError(null);
    try {
      const r = await fetch("/api/waitlist-export", {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      if (r.status === 401) {
        setError("Invalid token.");
        return;
      }
      if (!r.ok) {
        setError("Could not export CSV.");
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
      </form>

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
