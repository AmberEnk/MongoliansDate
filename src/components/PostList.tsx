import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import BrandLogo from "./BrandLogo";
import VoteButtons from "./VoteButtons";
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

  if (!posts.length) {
    return (
      <div className="forum-empty-state">
        <BrandLogo size={128} decorative />
        <h2>{t("forum.emptyTitle")}</h2>
        <p className="muted">{t("forum.empty")}</p>
        {loggedIn ? (
          <Link to="/submit" className="btn">
            {t("forum.newPost")}
          </Link>
        ) : (
          <Link to="/register" className="btn">
            {t("forum.joinToPost")}
          </Link>
        )}
      </div>
    );
  }

  return (
    <ul className="post-list">
      {posts.map((p) => (
        <li key={p.id} className="post-card">
          <VoteButtons postId={p.id} score={p.score} onVoted={onVoted} />
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
            <p className="post-card__comments">
              <Link to={`/p/${p.id}`}>{t("forum.commentsCount", { count: p.commentCount })}</Link>
              {" · "}
              <Link to={`/help?post=${p.id}`}>{t("help.report")}</Link>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
