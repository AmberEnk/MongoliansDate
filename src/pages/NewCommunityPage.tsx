import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import * as forum from "../forum/api";

export default function NewCommunityPage() {
  const { t } = useTranslation();
  const { loggedIn, ready } = useAuth();
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (ready && !loggedIn) return <Navigate to="/login" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const r = await forum.createCommunity({ title, slug, description });
      nav(`/c/${r.community.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("forum.saveFail"));
    }
  }

  return (
    <div className="forum-page">
      <p className="chat-back">
        <Link to="/explore">{t("forum.backExplore")}</Link>
      </p>
      <h1>{t("forum.startCommunity")}</h1>
      <p className="subtle-hint">{t("forum.startCommunityIntro")}</p>
      <form className="card composer" onSubmit={(e) => void onSubmit(e)}>
        <label>
          {t("forum.communityTitle")}
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Chicago" />
        </label>
        <label>
          {t("forum.communitySlug")}
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="chicago" />
        </label>
        <label>
          {t("forum.communityAbout")}
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>
        {error ? <p className="err">{error}</p> : null}
        <button className="btn" type="submit">
          {t("forum.createCommunity")}
        </button>
      </form>
    </div>
  );
}
