import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import BrandLogo from "../components/BrandLogo";
import * as forum from "../forum/api";
import type { DatingListing } from "../forum/types";

export default function DatingPage() {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const nav = useNavigate();
  const [listings, setListings] = useState<DatingListing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [age, setAge] = useState("28");
  const [intro, setIntro] = useState("");
  const [contact, setContact] = useState("");
  const [messagingId, setMessagingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setListings(await forum.fetchDating());
    } catch (e) {
      setError(e instanceof Error ? e.message : t("forum.loadFail"));
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await forum.saveDating({ city, age: Number(age), intro, contact });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("forum.saveFail"));
    }
  }

  async function onMessage(listing: DatingListing) {
    if (!loggedIn) {
      nav("/login");
      return;
    }
    setMessagingId(listing.id);
    setError(null);
    try {
      const r = await forum.startDm({ listingId: listing.id });
      nav(`/messages/${r.threadId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("chat.sendFail"));
    } finally {
      setMessagingId(null);
    }
  }

  return (
    <div className="forum-page">
      <header className="forum-page__head">
        <div>
          <h1>{t("dating.boardTitle")}</h1>
          <p className="subtle-hint">{t("dating.boardIntro")}</p>
        </div>
        <div className="edit-actions">
          {loggedIn ? (
            <Link to="/messages" className="btn secondary">
              {t("chat.inboxTitle")}
            </Link>
          ) : null}
          <Link to="/c/dating" className="btn secondary">
            {t("dating.openTalk")}
          </Link>
        </div>
      </header>

      {loggedIn ? (
        <form className="card composer" onSubmit={(e) => void onSubmit(e)}>
          <h2 className="landing-waitlist-card__title">{t("dating.postTitle")}</h2>
          <p className="subtle-hint">{t("dating.postHint")}</p>
          <label>
            {t("dating.city")}
            <input value={city} onChange={(e) => setCity(e.target.value)} required />
          </label>
          <label>
            {t("dating.age")}
            <input type="number" min={18} max={120} value={age} onChange={(e) => setAge(e.target.value)} required />
          </label>
          <label>
            {t("dating.intro")}
            <textarea value={intro} onChange={(e) => setIntro(e.target.value)} required minLength={8} rows={4} />
          </label>
          <label>
            {t("dating.contact")}
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder={t("dating.contactPlaceholder")} />
          </label>
          <button className="btn" type="submit">
            {t("dating.publish")}
          </button>
        </form>
      ) : (
        <p className="card guest-note">
          {t("dating.guestNote")}{" "}
          <Link to="/register">{t("register.signUp")}</Link>
        </p>
      )}

      {error ? <p className="err">{error}</p> : null}

      <ul className="dating-list">
        {listings.map((row) => (
          <li key={row.id} className="card dating-card">
            <h2>
              {row.displayName}, {row.age}
            </h2>
            <p className="muted">{row.city}</p>
            <p>{row.intro}</p>
            {row.contactHidden ? (
              <p className="muted">{t("dating.contactLocked")}</p>
            ) : row.contact ? (
              <p>
                <strong>{t("dating.contact")}:</strong> {row.contact}
              </p>
            ) : (
              <p className="muted">{t("dating.noContact")}</p>
            )}
            <p className="edit-actions">
              {row.isMine ? (
                <span className="muted">{t("dating.yourListing")}</span>
              ) : (
                <button
                  type="button"
                  className="btn"
                  disabled={messagingId === row.id}
                  onClick={() => void onMessage(row)}
                >
                  {messagingId === row.id ? t("common.loading") : t("dating.message")}
                </button>
              )}
            </p>
          </li>
        ))}
      </ul>
      {!listings.length ? (
        <div className="forum-empty-state">
          <BrandLogo size={120} decorative />
          <p className="muted">{t("dating.empty")}</p>
        </div>
      ) : null}
    </div>
  );
}
