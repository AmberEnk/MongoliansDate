import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import VoteButtons from "../components/VoteButtons";
import * as forum from "../forum/api";
import type { ForumComment, ForumPost } from "../forum/types";

export default function PostPage() {
  const { id = "" } = useParams();
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const nav = useNavigate();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await forum.fetchPost(id);
      setPost(data.post);
      setComments(data.comments);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("forum.loadFail"));
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onComment(e: FormEvent) {
    e.preventDefault();
    if (!loggedIn) {
      nav("/login");
      return;
    }
    setError(null);
    try {
      await forum.createComment(id, body);
      setBody("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("forum.saveFail"));
    }
  }

  if (!post && !error) return <p className="forum-page muted">{t("common.loading")}</p>;

  return (
    <div className="forum-page">
      {post ? (
        <>
          <p className="chat-back">
            <Link to={`/c/${post.communitySlug}`}>c/{post.communitySlug}</Link>
          </p>
          <article className="card post-detail">
            <VoteButtons postId={post.id} score={post.score} onVoted={() => void load()} />
            <div>
              <p className="post-card__meta">
                {post.authorName} · {new Date(post.createdAt).toLocaleString()}
              </p>
              <h1>{post.title}</h1>
              {post.body ? <p className="post-detail-body">{post.body}</p> : null}
              <p>
                <Link to={`/help?post=${post.id}`}>{t("help.report")}</Link>
              </p>
            </div>
          </article>
        </>
      ) : null}
      {error ? <p className="err">{error}</p> : null}
      <h2 className="forum-section-title">{t("forum.replies")}</h2>
      <ul className="comment-list">
        {comments.map((c) => (
          <li key={c.id} className="card comment-card">
            <p className="post-card__meta">{c.authorName}</p>
            <p>{c.body}</p>
          </li>
        ))}
      </ul>
      {loggedIn ? (
        <form className="card composer" onSubmit={(e) => void onComment(e)}>
          <label>
            {t("forum.yourReply")}
            <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={3} />
          </label>
          <button className="btn" type="submit">
            {t("forum.reply")}
          </button>
        </form>
      ) : (
        <p className="card guest-note">
          {t("forum.guestReply")}{" "}
          <Link to="/login">{t("home.signIn")}</Link>
        </p>
      )}
    </div>
  );
}
