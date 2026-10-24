import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import * as forum from "../forum/api";
import { communityDescription, communityTitle } from "../forum/labels";
import type { Community } from "../forum/types";

export default function ExplorePage() {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [mine, setMine] = useState<Community[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void forum
      .fetchCommunities()
      .then(setCommunities)
      .catch((e) => setError(e instanceof Error ? e.message : t("forum.loadFail")));
  }, [t]);

  useEffect(() => {
    if (!loggedIn) {
      setMine([]);
      return;
    }
    void forum
      .fetchMine()
      .then((data) => setMine(data.communities))
      .catch(() => setMine([]));
  }, [loggedIn]);

  return (
    <div className="forum-page">
      <header className="forum-page__head">
        <div>
          <h1>{t("forum.explore")}</h1>
          <p className="subtle-hint">{t("forum.exploreIntro")}</p>
        </div>
        {loggedIn ? (
          <Link to="/communities/new" className="btn">
            {t("forum.startCommunity")}
          </Link>
        ) : (
          <Link to="/register" className="btn secondary">
            {t("forum.joinToPost")}
          </Link>
        )}
      </header>
      {error ? <p className="err">{error}</p> : null}
      {mine.length ? (
        <>
          <h2 className="forum-section-title">{t("forum.myCommunities")}</h2>
          <ul className="community-grid">
            {mine.map((c) => (
              <li key={`mine-${c.slug}`}>
                <Link to={`/c/${c.slug}`} className="community-card community-card--mine">
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
          <h2 className="forum-section-title">{t("forum.allCommunities")}</h2>
        </>
      ) : null}
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
    </div>
  );
}
