import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import VoteButtons from "../components/VoteButtons";
import * as forum from "../forum/api";
import { isStillEditable, minutesLeft } from "../forum/editWindow";
import type { ForumComment, ForumPost } from "../forum/types";

export default function PostPage() {
  const { id = "" } = useParams();
  const { t } = useTranslation();
  const { loggedIn, user } = useAuth();
  const nav = useNavigate();
  const isSuperAdmin = !!user?.isSuperAdmin;
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [tick, setTick] = useState(0);

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

  useEffect(() => {
    if (!post?.editableUntil || !isStillEditable(post.editableUntil)) return;
    const timer = window.setInterval(() => setTick((n) => n + 1), 15_000);
    return () => window.clearInterval(timer);
  }, [post?.editableUntil]);

  const canEdit = !!(post?.canEdit && isStillEditable(post.editableUntil));
  void tick;

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

  function startEdit() {
    if (!post) return;
    setEditTitle(post.title);
    setEditBody(post.body || "");
    setEditing(true);
    setError(null);
  }

  async function onSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!post) return;
    setSaving(true);
    setError(null);
    try {
      await forum.editPost({ postId: post.id, title: editTitle, body: editBody });
      setEditing(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("forum.saveFail"));
    } finally {
      setSaving(false);
    }
  }

  async function onDeletePost() {
    if (!post) return;
    if (!window.confirm(t("forum.deletePostConfirm"))) return;
    setError(null);
    try {
      await forum.deletePost(post.id);
      nav(`/c/${post.communitySlug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("forum.saveFail"));
    }
  }

  async function onDeleteComment(commentId: string) {
    if (!window.confirm(t("forum.deleteCommentConfirm"))) return;
    setError(null);
    try {
      await forum.deleteComment(commentId);
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
                {canEdit ? (
                  <>
                    {" · "}
                    <span className="muted">{t("forum.editWindowLeft", { minutes: minutesLeft(post.editableUntil) })}</span>
                  </>
                ) : null}
              </p>
              {editing ? (
                <form className="composer edit-inline" onSubmit={(e) => void onSaveEdit(e)}>
                  <label>
                    {t("forum.postTitle")}
                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required minLength={3} />
                  </label>
                  <label>
                    {t("forum.postBody")}
                    <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={6} />
                  </label>
                  <div className="edit-actions">
                    <button className="btn" type="submit" disabled={saving}>
                      {t("forum.saveEdit")}
                    </button>
                    <button className="btn secondary" type="button" disabled={saving} onClick={() => setEditing(false)}>
                      {t("common.cancel")}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h1>{post.title}</h1>
                  {post.body ? <p className="post-detail-body">{post.body}</p> : null}
                  <p className="edit-actions">
                    {canEdit ? (
                      <button type="button" className="btn secondary" onClick={startEdit}>
                        {t("forum.editPost")}
                      </button>
                    ) : null}
                    {isSuperAdmin ? (
                      <button type="button" className="btn secondary" onClick={() => void onDeletePost()}>
                        {t("forum.deletePost")}
                      </button>
                    ) : null}
                    <Link to={`/help?post=${post.id}`}>{t("help.report")}</Link>
                  </p>
                </>
              )}
            </div>
          </article>
        </>
      ) : null}
      {error ? <p className="err">{error}</p> : null}
      <h2 className="forum-section-title">{t("forum.replies")}</h2>
      <ul className="comment-list">
        {comments.map((c) => (
          <li key={c.id} className="card comment-card">
            <p className="post-card__meta">
              {c.authorName}
              {isSuperAdmin ? (
                <>
                  {" · "}
                  <button type="button" className="linkish" onClick={() => void onDeleteComment(c.id)}>
                    {t("forum.deleteComment")}
                  </button>
                </>
              ) : null}
            </p>
            <p className="comment-card__body">{c.body}</p>
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
