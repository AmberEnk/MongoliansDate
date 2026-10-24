import { FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import * as forum from "../forum/api";
import type { Community } from "../forum/types";

export default function SubmitPage() {
  const { communitySlug } = useParams();
  const { t } = useTranslation();
  const { loggedIn, ready } = useAuth();
  const nav = useNavigate();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [slug, setSlug] = useState(communitySlug || "general");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void forum.fetchCommunities().then(setCommunities).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (communitySlug) setSlug(communitySlug);
  }, [communitySlug]);

  if (ready && !loggedIn) return <Navigate to="/login" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const r = await forum.createPost({ communitySlug: slug, title, body });
      nav(`/p/${r.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("forum.saveFail"));
    }
  }

  return (
    <div className="forum-page">
      <p className="chat-back">
        <Link to="/">{t("forum.home")}</Link>
      </p>
      <h1>{t("forum.newPost")}</h1>
      <form className="card composer" onSubmit={(e) => void onSubmit(e)}>
        <label>
          {t("forum.community")}
          <select value={slug} onChange={(e) => setSlug(e.target.value)}>
            {communities.map((c) => (
              <option key={c.slug} value={c.slug}>
                c/{c.slug} — {c.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("forum.postTitle")}
          <input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} />
        </label>
        <label>
          {t("forum.postBody")}
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} />
        </label>
        {error ? <p className="err">{error}</p> : null}
        <button className="btn" type="submit">
          {t("forum.publish")}
        </button>
      </form>
    </div>
  );
}
