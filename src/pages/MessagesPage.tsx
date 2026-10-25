import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import * as forum from "../forum/api";
import type { DmThreadSummary } from "../forum/types";

export default function MessagesPage() {
  const { t } = useTranslation();
  const { loggedIn, ready } = useAuth();
  const [threads, setThreads] = useState<DmThreadSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await forum.fetchDmThreads();
      setThreads(data.threads);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("chat.loadFail"));
    }
  }, [t]);

  useEffect(() => {
    if (loggedIn) void load();
  }, [loggedIn, load]);

  if (ready && !loggedIn) return <Navigate to="/login" replace />;

  return (
    <div className="forum-page">
      <header className="forum-page__head">
        <div>
          <h1>{t("chat.inboxTitle")}</h1>
          <p className="subtle-hint">{t("chat.inboxIntro")}</p>
        </div>
        <Link to="/dating" className="btn secondary">
          {t("forum.dating")}
        </Link>
      </header>
      {error ? <p className="err">{error}</p> : null}
      {!threads.length && !error ? <p className="muted">{t("chat.inboxEmpty")}</p> : null}
      <ul className="dm-list">
        {threads.map((th) => (
          <li key={th.id}>
            <Link to={`/messages/${th.id}`} className="card dm-card">
              <p className="post-card__meta">{new Date(th.updatedAt).toLocaleString()}</p>
              <h2>{th.otherName}</h2>
              <p className="muted">{th.lastBody || t("chat.noMessagesYet")}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
