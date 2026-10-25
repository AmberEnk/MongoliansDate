import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import * as forum from "../forum/api";
import type { ModerationReport } from "../forum/api";

function normalizeBearerSecret(raw: string): string {
  let s = raw.trim();
  if (/^Bearer\s+/i.test(s)) s = s.replace(/^Bearer\s+/i, "").trim();
  return s;
}

export default function AdminModerationPage() {
  const { user, ready, loggedIn } = useAuth();
  const isSuperAdmin = !!user?.isSuperAdmin;
  const [token, setToken] = useState("");
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoTried, setAutoTried] = useState(false);

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

  async function load(e?: FormEvent, authOverride?: string) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const secret = authOverride ?? (isSuperAdmin ? forum.getToken() || "" : normalizeBearerSecret(token));
      if (!secret) {
        setError(isSuperAdmin ? "Sign in again as super admin." : "Enter admin token.");
        setReports([]);
        return;
      }
      const data = await forum.fetchReports(secret);
      setReports(data.reports);
    } catch (er) {
      setReports([]);
      setError(er instanceof Error ? er.message : "Could not load reports.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready || autoTried) return;
    if (isSuperAdmin) {
      setAutoTried(true);
      void load(undefined, forum.getToken() || undefined);
    }
  }, [ready, isSuperAdmin, autoTried]);

  async function ban(userId: string) {
    if (!window.confirm("Close this account? They cannot sign up again with the same email.")) return;
    setError(null);
    try {
      const secret = isSuperAdmin ? forum.getToken() || "" : normalizeBearerSecret(token);
      await forum.banUser(secret, userId);
      await load(undefined, secret);
    } catch (er) {
      setError(er instanceof Error ? er.message : "Could not close the account.");
    }
  }

  async function removePost(postId: string) {
    if (!window.confirm("Delete this post and its replies?")) return;
    setError(null);
    try {
      const secret = isSuperAdmin ? forum.getToken() || "" : normalizeBearerSecret(token);
      await forum.deletePost(postId, secret || undefined);
      await load(undefined, secret);
    } catch (er) {
      setError(er instanceof Error ? er.message : "Could not delete the post.");
    }
  }

  return (
    <div className="forum-page">
      <h1>Moderation</h1>
      {isSuperAdmin ? (
        <p className="subtle-hint">
          Signed in as super admin ({user?.email}). Reports load with your account — no separate token needed.
        </p>
      ) : (
        <p className="subtle-hint">
          Use the admin token (WAITLIST_EXPORT_TOKEN in Vercel), or sign in with a super admin account. Do not share this
          page.
          {!loggedIn ? (
            <>
              {" "}
              <Link to="/login">Sign in</Link>
            </>
          ) : null}
        </p>
      )}
      {!isSuperAdmin ? (
        <form className="card composer" onSubmit={(e) => void load(e)}>
          <label>
            Token
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" />
          </label>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Loading…" : "Load reports"}
          </button>
        </form>
      ) : (
        <p>
          <button className="btn secondary" type="button" disabled={loading} onClick={() => void load()}>
            {loading ? "Loading…" : "Refresh reports"}
          </button>
        </p>
      )}
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
            {r.postTitle ? (
              <p>
                <strong>{r.postTitle}</strong>
              </p>
            ) : null}
            <p>{r.reason}</p>
            <p className="muted">
              From {r.reporterName || "guest"} {r.reporterEmail ? `(${r.reporterEmail})` : ""}
            </p>
            {r.targetId ? (
              <p className="muted">
                Account {r.targetName} ({r.targetEmail}) {r.banned ? "— closed" : ""}
              </p>
            ) : null}
            <p className="edit-actions">
              {r.postId ? (
                <button type="button" className="btn secondary" onClick={() => void removePost(r.postId as string)}>
                  Delete post
                </button>
              ) : null}
              {r.targetId && !r.banned ? (
                <button type="button" className="btn secondary" onClick={() => void ban(r.targetId as string)}>
                  Close account
                </button>
              ) : null}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
