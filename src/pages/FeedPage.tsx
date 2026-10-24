import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import PostList from "../components/PostList";
import * as forum from "../forum/api";
import type { ForumPost } from "../forum/types";

export default function FeedPage({ kind }: { kind: "feed" | "popular" | "news" }) {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    try {
      setPosts(await forum.fetchFeed(kind));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("forum.loadFail"));
    } finally {
      setLoading(false);
    }
  }, [kind, t]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const titleKey = kind === "popular" ? "forum.popular" : kind === "news" ? "forum.news" : "forum.home";
  const introKey = kind === "popular" ? "forum.popularIntro" : kind === "news" ? "forum.newsIntro" : "forum.homeIntro";

  return (
    <div className="forum-page">
      <header className="forum-page__head">
        <div>
          <h1>{t(titleKey)}</h1>
          <p className="subtle-hint">{t(introKey)}</p>
        </div>
        {loggedIn ? (
          <Link to={kind === "news" ? "/submit/news" : "/submit"} className="btn">
            {t("forum.newPost")}
          </Link>
        ) : (
          <Link to="/register" className="btn">
            {t("forum.joinToPost")}
          </Link>
        )}
      </header>
      {loading ? <p className="muted">{t("common.loading")}</p> : null}
      {error ? <p className="err">{error}</p> : null}
      {!loading && !error ? <PostList posts={posts} onVoted={() => void load()} /> : null}
    </div>
  );
}
