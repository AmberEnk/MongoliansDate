import { FormEvent, useEffect, useState } from "react";
import * as forum from "../forum/api";
import type { ModerationReport } from "../forum/api";

function normalizeBearerSecret(raw: string): string {
  let s = raw.trim();
  if (/^Bearer\s+/i.test(s)) s = s.replace(/^Bearer\s+/i, "").trim();
  return s;
}

export default function AdminModerationPage() {
  const [token, setToken] = useState("");
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    document.title = "Moderation";
    return () => {
      meta.remove();
    };
  }, []);

  async function load(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await forum.fetchReports(normalizeBearerSecret(token));
      setReports(data.reports);
    } catch (er) {
      setReports([]);
      setError(er instanceof Error ? er.message : "Could not load reports.");
    } finally {
      setLoading(false);
    }
  }

  async function ban(userId: string) {
    if (!window.confirm("Close this account? They cannot sign up again with the same email.")) return;
    setError(null);
    try {
      await forum.banUser(normalizeBearerSecret(token), userId);
      await load();
    } catch (er) {
      setError(er instanceof Error ? er.message : "Could not close the account.");
    }
  }

  return (
    <div className="forum-page">
      <h1>Moderation</h1>
      <p className="subtle-hint">Use the same WAITLIST_EXPORT_TOKEN. Reports stay here so you can close accounts. Do not share this page.</p>
      <form className="card composer" onSubmit={(e) => void load(e)}>
        <label>
          Token
          <input type="password" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" />
        </label>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Loading…" : "Load reports"}
        </button>
      </form>
      {error ? <p className="err">{error}</p> : null}
      <ul className="post-list">
        {reports.map((r) => (
          <li key={r.id} className="card">
            <p className="post-card__meta">
              {new Date(r.createdAt).toLocaleString()}
              {r.postId ? (
                <>
                  {" · "}
                  <a href={`/p/${r.postId}`}>post {r.postId}</a>
                </>
              ) : null}
            </p>
            {r.postTitle ? <p><strong>{r.postTitle}</strong></p> : null}
            <p>{r.reason}</p>
            <p className="muted">
              From {r.reporterName || "guest"} {r.reporterEmail ? `(${r.reporterEmail})` : ""}
            </p>
            {r.targetId ? (
              <p className="muted">
                Account {r.targetName} ({r.targetEmail}) {r.banned ? "— closed" : ""}
              </p>
            ) : null}
            {r.targetId && !r.banned ? (
              <button type="button" className="btn secondary" onClick={() => void ban(r.targetId as string)}>
                Close account
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
