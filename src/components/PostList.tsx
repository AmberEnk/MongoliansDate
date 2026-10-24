import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import * as forum from "../forum/api";
import type { ForumPost } from "../forum/types";

function timeAgo(iso: string, locale: string): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}d`;
  return new Date(iso).toLocaleDateString(locale.startsWith("mn") ? "mn-MN" : "en-US");
}

export default function PostList({
  posts,
  onVoted,
}: {
  posts: ForumPost[];
  onVoted?: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { loggedIn } = useAuth();
  const nav = useNavigate();

  async function onVote(id: string, value: 1 | -1) {
    if (!loggedIn) {
      nav("/login");
      return;
    }
    try {
      await forum.vote(id, value);
      onVoted?.();
    } catch {
      /* ignore */
    }
  }

  if (!posts.length) {
    return <p className="muted forum-empty">{t("forum.empty")}</p>;
  }

  return (
    <ul className="post-list">
      {posts.map((p) => (
        <li key={p.id} className="post-card">
          <div className="vote-col">
            <button type="button" className="vote-btn" aria-label={t("forum.upvote")} onClick={() => void onVote(p.id, 1)}>
              ▲
            </button>
            <span className="vote-score">{p.score}</span>
            <button type="button" className="vote-btn" aria-label={t("forum.downvote")} onClick={() => void onVote(p.id, -1)}>
              ▼
            </button>
          </div>
          <div className="post-card__body">
            <p className="post-card__meta">
              <Link to={`/c/${p.communitySlug}`}>c/{p.communitySlug}</Link>
              {" · "}
              {p.authorName}
              {" · "}
              {timeAgo(p.createdAt, i18n.language)}
            </p>
            <Link to={`/p/${p.id}`} className="post-card__title">
              {p.title}
            </Link>
            {p.body ? <p className="post-card__excerpt">{p.body}</p> : null}
            <Link to={`/p/${p.id}`} className="post-card__comments">
              {t("forum.commentsCount", { count: p.commentCount })}
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
