import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import * as forum from "../forum/api";
import type { DatingListing } from "../forum/types";

export default function DatingPage() {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const [listings, setListings] = useState<DatingListing[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [age, setAge] = useState("28");
  const [intro, setIntro] = useState("");
  const [contact, setContact] = useState("");

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

  return (
    <div className="forum-page">
      <header className="forum-page__head">
        <div>
          <h1>{t("dating.boardTitle")}</h1>
          <p className="subtle-hint">{t("dating.boardIntro")}</p>
        </div>
        <Link to="/c/dating" className="btn secondary">
          {t("dating.openTalk")}
        </Link>
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
          </li>
        ))}
      </ul>
      {!listings.length ? <p className="muted forum-empty">{t("dating.empty")}</p> : null}
    </div>
  );
}
