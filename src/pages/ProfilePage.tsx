import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import LinkifiedText from "../components/LinkifiedText";
import PostList from "../components/PostList";
import * as forum from "../forum/api";
import { communityDescription, communityTitle } from "../forum/labels";
import type { Community, ProfileComment, ForumPost, PublicProfile } from "../forum/types";

function CommunityList({ items }: { items: Community[] }) {
  const { t } = useTranslation();
  return (
    <ul className="community-grid">
      {items.map((c) => (
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
  );
}

export default function ProfilePage() {
  const { id = "" } = useParams();
  const { t } = useTranslation();
  const { user, loggedIn, refresh } = useAuth();
  const nav = useNavigate();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [created, setCreated] = useState<Community[]>([]);
  const [joined, setJoined] = useState<Community[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [comments, setComments] = useState<ProfileComment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const mine = !!user && user.id === id;

  const load = useCallback(async () => {
    try {
      const data = await forum.fetchProfile(id);
      setProfile(data.profile);
      setCreated(data.createdCommunities);
      setJoined(data.joinedCommunities);
      setPosts(data.posts);
      setComments(data.comments);
      setName(data.profile.displayName);
      setError(null);
    } catch (e) {
      setProfile(null);
      setError(e instanceof Error ? e.message : t("forum.loadFail"));
    }
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onFollow() {
    if (!loggedIn) {
      nav("/login");
      return;
    }
    if (!profile) return;
    await forum.followUser(profile.id, !profile.following);
    await load();
  }

  async function onMessage() {
    if (!loggedIn) {
      nav("/login");
      return;
    }
    if (!profile) return;
    const r = await forum.startDm({ userId: profile.id });
    nav(`/messages/${r.threadId}`);
  }

  async function onRename(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const r = await forum.updateDisplayName(name);
      await refresh();
      setProfile((p) => (p ? { ...p, displayName: r.user.displayName } : p));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("forum.saveFail"));
    } finally {
      setSaving(false);
    }
  }

  if (!profile && !error) return <p className="forum-page muted">{t("common.loading")}</p>;
  if (!profile) return <p className="forum-page err">{error}</p>;

  const previous = profile.nameHistory.slice(0, -1);
  const joinedLabel = new Date(profile.createdAt).toLocaleDateString();

  return (
    <div className="forum-page">
      <header className="profile-head card">
        <div>
          <p className="profile-head__id">u/{profile.id}</p>
          <h1>{profile.displayName}</h1>
          <p className="subtle-hint">{t("profile.memberSince", { date: joinedLabel })}</p>
          <ul className="profile-stats">
            <li>
              <strong>{profile.karma}</strong> {t("profile.karma")}
            </li>
            <li>
              <strong>{profile.postCount}</strong> {t("profile.posts")}
            </li>
            <li>
              <strong>{profile.commentCount}</strong> {t("profile.comments")}
            </li>
            <li>
              <strong>{profile.followerCount}</strong> {t("profile.followers")}
            </li>
          </ul>
        </div>
        {!mine ? (
          <div className="profile-head__actions">
            {loggedIn ? (
              <>
                <button type="button" className={profile.following ? "btn secondary" : "btn"} onClick={() => void onFollow()}>
                  {profile.following ? t("profile.unfollow") : t("profile.follow")}
                </button>
                <button type="button" className="btn secondary" onClick={() => void onMessage()}>
                  {t("profile.message")}
                </button>
              </>
            ) : (
              <>
                <Link className="btn" to="/login">
                  {t("profile.follow")}
                </Link>
                <Link className="btn secondary" to="/login">
                  {t("profile.message")}
                </Link>
              </>
            )}
            <Link className="muted" to={`/help?user=${profile.id}`}>
              {t("help.report")}
            </Link>
          </div>
        ) : null}
      </header>

      <section className="card profile-history">
        <h2>{t("profile.nameHistory")}</h2>
        <p className="subtle-hint">{t("profile.nameHistoryIntro")}</p>
        {previous.length ? (
          <ul>
            {previous.map((n) => (
              <li key={`${n.displayName}-${n.changedAt}`}>
                {n.displayName}{" "}
                <span className="muted">· {new Date(n.changedAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">{t("profile.nameUnchanged")}</p>
        )}
        {mine ? (
          <form className="composer" onSubmit={(e) => void onRename(e)}>
            <label>
              {t("profile.changeName")}
              <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={40} />
            </label>
            <button className="btn" type="submit" disabled={saving}>
              {t("profile.saveName")}
            </button>
          </form>
        ) : null}
      </section>

      {error && profile ? <p className="err">{error}</p> : null}

      <h2 className="forum-section-title">{t("profile.createdCommunities")}</h2>
      {created.length ? <CommunityList items={created} /> : <p className="muted">{t("profile.noCreated")}</p>}

      <h2 className="forum-section-title">{t("profile.joinedCommunities")}</h2>
      {joined.length ? <CommunityList items={joined} /> : <p className="muted">{t("profile.noJoined")}</p>}

      <h2 className="forum-section-title">{t("profile.posts")}</h2>
      {posts.length ? <PostList posts={posts} /> : <p className="muted">{t("profile.noPosts")}</p>}

      <h2 className="forum-section-title">{t("profile.comments")}</h2>
      {comments.length ? (
        <ul className="comment-list">
          {comments.map((c) => (
            <li key={c.id} className="card comment-card">
              <p className="post-card__meta">
                <Link to={`/p/${c.postId}`}>{c.postTitle}</Link>
                {" · "}
                {t("profile.commentScore", { count: c.score })}
              </p>
              <p className="comment-card__body">
                <LinkifiedText text={c.body} />
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">{t("profile.noComments")}</p>
      )}
    </div>
  );
}
