import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import PostList from "../components/PostList";
import * as forum from "../forum/api";
import type { Community, ForumPost } from "../forum/types";

export default function CommunityPage() {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const nav = useNavigate();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await forum.fetchCommunity(slug);
      setCommunity(data.community);
      setPosts(data.posts);
    } catch (e) {
      setCommunity(null);
      setError(e instanceof Error ? e.message : t("forum.loadFail"));
    }
  }, [slug, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onPost(e: FormEvent) {
    e.preventDefault();
    if (!loggedIn) {
      nav("/login");
      return;
    }
    setPosting(true);
    setError(null);
    try {
      await forum.createPost({ communitySlug: slug, title, body });
      setTitle("");
      setBody("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("forum.saveFail"));
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="forum-page">
      <p className="chat-back">
        <Link to="/explore">{t("forum.backExplore")}</Link>
      </p>
      {community ? (
        <header className="forum-page__head">
          <div>
            <p className="muted">c/{community.slug}</p>
            <h1>{community.title}</h1>
            <p className="subtle-hint">{community.description}</p>
          </div>
        </header>
      ) : null}
      {error ? <p className="err">{error}</p> : null}
      {loggedIn ? (
        <form className="card composer" onSubmit={(e) => void onPost(e)}>
          <h2 className="landing-waitlist-card__title">{t("forum.askOrPost")}</h2>
          <label>
            {t("forum.postTitle")}
            <input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} />
          </label>
          <label>
            {t("forum.postBody")}
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
          </label>
          <button className="btn" type="submit" disabled={posting}>
            {t("forum.publish")}
          </button>
        </form>
      ) : (
        <p className="card guest-note">
          {t("forum.guestRead")}{" "}
          <Link to="/register">{t("register.signUp")}</Link>
          {" · "}
          <Link to="/login">{t("home.signIn")}</Link>
        </p>
      )}
      <PostList posts={posts} onVoted={() => void load()} />
    </div>
  );
}
