import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import PostList from "../components/PostList";
import * as forum from "../forum/api";
import { communityDescription, communityTitle } from "../forum/labels";
import type { Community, ForumPost } from "../forum/types";

export default function MinePage() {
  const { t } = useTranslation();
  const { loggedIn, ready } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !loggedIn) return;
    setLoading(true);
    void forum
      .fetchMine()
      .then((data) => {
        setCommunities(data.communities);
        setPosts(data.posts);
      })
      .catch((e) => setError(e instanceof Error ? e.message : t("forum.loadFail")))
      .finally(() => setLoading(false));
  }, [ready, loggedIn, t]);

  if (ready && !loggedIn) return <Navigate to="/login" replace />;

  return (
    <div className="forum-page">
      <header className="forum-page__head">
        <div>
          <h1>{t("forum.mine")}</h1>
          <p className="subtle-hint">{t("forum.mineIntro")}</p>
        </div>
        <Link to="/communities/new" className="btn">
          {t("forum.startCommunity")}
        </Link>
      </header>
      {error ? <p className="err">{error}</p> : null}
      {loading ? <p className="muted">{t("common.loading")}</p> : null}

      <h2 className="forum-section-title">{t("forum.myCommunities")}</h2>
      {!loading && !communities.length ? (
        <p className="muted">
          {t("forum.myCommunitiesEmpty")}{" "}
          <Link to="/communities/new">{t("forum.startCommunity")}</Link>
        </p>
      ) : (
        <ul className="community-grid">
          {communities.map((c) => (
            <li key={c.slug}>
              <Link to={`/c/${c.slug}`} className="community-card">
                <span className="community-card__mark" aria-hidden="true">
                  {communityTitle(t, c.slug, c.title).slice(0, 1)}
                </span>
                <p className="community-card__slug">c/{c.slug}</p>
                <h2>{communityTitle(t, c.slug, c.title)}</h2>
                <p>{communityDescription(t, c.slug, c.description)}</p>
                <p className="muted">{t("forum.postCount", { count: c.postCount ?? 0 })}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="forum-section-title">{t("forum.myPosts")}</h2>
      {!loading && !posts.length ? (
        <p className="muted">
          {t("forum.myPostsEmpty")}{" "}
          <Link to="/submit">{t("forum.newPost")}</Link>
        </p>
      ) : (
        <PostList posts={posts} />
      )}
    </div>
  );
}
