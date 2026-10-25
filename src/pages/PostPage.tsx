import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import VoteButtons from "../components/VoteButtons";
import * as forum from "../forum/api";
import type { ForumComment, ForumPost } from "../forum/types";

function nestComments(flat: ForumComment[]): ForumComment[] {
  const byId = new Map<string, ForumComment>();
  for (const c of flat) {
    byId.set(c.id, { ...c, replies: [] });
  }
  const roots: ForumComment[] = [];
  for (const c of flat) {
    const node = byId.get(c.id)!;
    if (c.parentId && byId.has(c.parentId)) {
      byId.get(c.parentId)!.replies!.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

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
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentBody, setEditCommentBody] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");

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

  const tree = useMemo(() => nestComments(comments), [comments]);
  const canEditPost = !!post?.canEdit;
  const canDeletePost = !!(post?.canDelete || isSuperAdmin);

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

  async function onReply(e: FormEvent) {
    e.preventDefault();
    if (!loggedIn) {
      nav("/login");
      return;
    }
    if (!replyingTo || !replyBody.trim()) return;
    setError(null);
    try {
      await forum.createComment(id, replyBody.trim(), replyingTo);
      setReplyBody("");
      setReplyingTo(null);
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

  function startEditComment(c: ForumComment) {
    setEditingCommentId(c.id);
    setEditCommentBody(c.body);
    setReplyingTo(null);
    setError(null);
  }

  async function onSaveComment(e: FormEvent) {
    e.preventDefault();
    if (!editingCommentId) return;
    setSaving(true);
    setError(null);
    try {
      await forum.editComment(editingCommentId, editCommentBody);
      setEditingCommentId(null);
      setEditCommentBody("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("forum.saveFail"));
    } finally {
      setSaving(false);
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

  function renderComment(c: ForumComment, depth: number) {
    const canEditComment = !!c.canEdit;
    const canDeleteComment = !!(c.canDelete || isSuperAdmin);
    const nestedDepth = Math.min(depth, 4);

    return (
      <li key={c.id} className={`card comment-card comment-card--depth-${nestedDepth}`}>
        <div className="comment-card__row">
          <VoteButtons
            commentId={c.id}
            score={c.score ?? 0}
            myVote={c.myVote ?? 0}
            compact
            onVoted={() => void load()}
          />
          <div className="comment-card__main">
            <p className="post-card__meta">{c.authorName}</p>
            {editingCommentId === c.id ? (
              <form className="composer edit-inline" onSubmit={(e) => void onSaveComment(e)}>
                <label>
                  {t("forum.yourReply")}
                  <textarea
                    value={editCommentBody}
                    onChange={(e) => setEditCommentBody(e.target.value)}
                    required
                    rows={3}
                  />
                </label>
                <div className="edit-actions">
                  <button className="btn" type="submit" disabled={saving}>
                    {t("forum.saveEdit")}
                  </button>
                  <button
                    className="btn secondary"
                    type="button"
                    disabled={saving}
                    onClick={() => setEditingCommentId(null)}
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="comment-card__body">{c.body}</p>
                <p className="edit-actions">
                  {loggedIn ? (
                    <button
                      type="button"
                      className="linkish"
                      onClick={() => {
                        setReplyingTo(c.id);
                        setReplyBody("");
                        setEditingCommentId(null);
                      }}
                    >
                      {t("forum.reply")}
                    </button>
                  ) : (
                    <Link to="/login">{t("forum.reply")}</Link>
                  )}
                  {canEditComment ? (
                    <button type="button" className="linkish" onClick={() => startEditComment(c)}>
                      {t("forum.editComment")}
                    </button>
                  ) : null}
                  {canDeleteComment ? (
                    <button type="button" className="linkish" onClick={() => void onDeleteComment(c.id)}>
                      {t("forum.deleteComment")}
                    </button>
                  ) : null}
                </p>
                {replyingTo === c.id ? (
                  <form className="composer edit-inline" onSubmit={(e) => void onReply(e)}>
                    <label>
                      {t("forum.replyTo", { name: c.authorName })}
                      <textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} required rows={3} />
                    </label>
                    <div className="edit-actions">
                      <button className="btn" type="submit">
                        {t("forum.reply")}
                      </button>
                      <button className="btn secondary" type="button" onClick={() => setReplyingTo(null)}>
                        {t("common.cancel")}
                      </button>
                    </div>
                  </form>
                ) : null}
              </>
            )}
          </div>
        </div>
        {c.replies && c.replies.length ? (
          <ul className="comment-list comment-list--nested">{c.replies.map((child) => renderComment(child, depth + 1))}</ul>
        ) : null}
      </li>
    );
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
            <div className="post-detail__body">
              <p className="post-card__meta">
                {post.authorName} · {new Date(post.createdAt).toLocaleString()}
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
                    {canEditPost ? (
                      <button type="button" className="btn secondary" onClick={startEdit}>
                        {t("forum.editPost")}
                      </button>
                    ) : null}
                    {canDeletePost ? (
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
      <ul className="comment-list">{tree.map((c) => renderComment(c, 0))}</ul>
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
