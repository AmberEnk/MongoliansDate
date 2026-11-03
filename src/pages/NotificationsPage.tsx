import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useAuth } from "../auth/AuthContext";
import * as forum from "../forum/api";
import type { ForumNotification } from "../forum/types";

function noticeText(t: TFunction, n: ForumNotification) {
  const actor = n.actorName || t("profile.someone");
  const post = n.postTitle || t("profile.aPost");
  if (n.kind === "comment") return t("profile.noticeComment", { actor, post });
  if (n.kind === "follow_post_comment") return t("profile.noticeFollowedPost", { actor, post });
  if (n.kind === "follow_user_post") return t("profile.noticeFollowedUser", { actor, post });
  if (n.kind === "follow") return t("profile.noticeFollow", { actor });
  if (n.kind === "message") return t("profile.noticeMessage", { actor });
  return t("profile.noticeGeneric", { actor });
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { loggedIn, ready, refresh } = useAuth();
  const [items, setItems] = useState<ForumNotification[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !loggedIn) return;
    void forum
      .fetchNotifications()
      .then(async (data) => {
        setItems(data.items);
        await forum.markNotificationsRead();
        await refresh();
      })
      .catch((e) => setError(e instanceof Error ? e.message : t("forum.loadFail")));
  }, [ready, loggedIn, refresh, t]);

  if (ready && !loggedIn) return <Navigate to="/login" replace />;

  return (
    <div className="forum-page">
      <header className="forum-page__head">
        <div>
          <h1>{t("profile.notifications")}</h1>
          <p className="subtle-hint">{t("profile.notificationsIntro")}</p>
        </div>
      </header>
      {error ? <p className="err">{error}</p> : null}
      {!items.length ? <p className="muted">{t("profile.noNotifications")}</p> : null}
      <ul className="notice-list">
        {items.map((n) => {
          const href =
            n.kind === "message"
              ? "/messages"
              : n.kind === "follow" && n.actorId
                ? `/u/${n.actorId}`
                : n.postId
                  ? `/p/${n.postId}`
                  : n.actorId
                    ? `/u/${n.actorId}`
                    : "/";
          return (
            <li key={n.id} className={n.read ? "card notice-card" : "card notice-card notice-card--new"}>
              <Link to={href}>
                <p>{noticeText(t, n)}</p>
                <p className="muted">{new Date(n.createdAt).toLocaleString()}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
