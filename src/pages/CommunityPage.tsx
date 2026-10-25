import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import PostList from "../components/PostList";
import * as forum from "../forum/api";
import { communityDescription, communityTitle } from "../forum/labels";
import type { Community, ForumPost } from "../forum/types";

export default function CommunityPage() {
  const { slug = "" } = useParams();
  const { t } = useTranslation();
  const { loggedIn, user } = useAuth();
  const nav = useNavigate();
  const isSuperAdmin = !!user?.isSuperAdmin;
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

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

  const canEdit = !!community?.canEdit;
  const showDelete = !!(community && (community.canDelete || (isSuperAdmin && community.isUserCreated)));

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

  function startEdit() {
    if (!community) return;
    setEditTitle(community.title);
    setEditDescription(community.description || "");
    setEditing(true);
    setError(null);
  }

  async function onSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!community) return;
    setSaving(true);
    setError(null);
    try {
      await forum.editCommunity({
        slug: community.slug,
        title: editTitle,
        description: editDescription,
      });
      setEditing(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("forum.saveFail"));
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteCommunity() {
    if (!community) return;
    if (!window.confirm(t("forum.deleteCommunityConfirm"))) return;
    setError(null);
    try {
      await forum.deleteCommunity(community.slug);
      nav("/explore");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("forum.saveFail"));
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
            {editing ? (
              <form className="card composer edit-inline" onSubmit={(e) => void onSaveEdit(e)}>
                <label>
                  {t("forum.communityTitle")}
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required minLength={2} />
                </label>
                <label>
                  {t("forum.communityAbout")}
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
                </label>
                <p className="subtle-hint">{t("forum.editCommunitySlugHint")}</p>
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
                <h1>{communityTitle(t, community.slug, community.title)}</h1>
                <p className="subtle-hint">{communityDescription(t, community.slug, community.description)}</p>
                {canEdit || showDelete ? (
                  <p className="edit-actions">
                    {canEdit ? (
                      <button type="button" className="btn secondary" onClick={startEdit}>
                        {t("forum.editCommunity")}
                      </button>
                    ) : null}
                    {showDelete ? (
                      <button type="button" className="btn secondary" onClick={() => void onDeleteCommunity()}>
                        {t("forum.deleteCommunity")}
                      </button>
                    ) : null}
                  </p>
                ) : null}
              </>
            )}
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
      <PostList posts={posts} onVoted={() => void load()} onChanged={() => void load()} />
    </div>
  );
}
