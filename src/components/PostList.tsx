import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import BrandLogo from "./BrandLogo";
import VoteButtons from "./VoteButtons";
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
  onChanged,
}: {
  posts: ForumPost[];
  onVoted?: () => void;
  onChanged?: () => void;
}) {
  const { t, i18n } = useTranslation();
  const { loggedIn, user } = useAuth();
  const isSuperAdmin = !!user?.isSuperAdmin;

  async function onDeletePost(postId: string) {
    if (!window.confirm(t("forum.deletePostConfirm"))) return;
    try {
      await forum.deletePost(postId);
      onChanged?.();
      onVoted?.();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : t("forum.saveFail"));
    }
  }

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
              {isSuperAdmin ? (
                <>
                  {" · "}
                  <button type="button" className="linkish" onClick={() => void onDeletePost(p.id)}>
                    {t("forum.deletePost")}
                  </button>
                </>
              ) : null}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
