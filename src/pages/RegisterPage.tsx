import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useTranslation();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [birthdate, setBirthdate] = useState("1995-01-01");
  const [err, setErr] = useState<string | null>(null);
  const LETTER_NUMBER_SPACE_ONLY = /^[\p{L}\p{N} ]+$/u;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!LETTER_NUMBER_SPACE_ONLY.test(displayName.trim())) {
      setErr(t("register.nameRule"));
      return;
    }
    try {
      await register({ email, password, displayName, birthdate });
      nav("/");
    } catch (er) {
      setErr(er instanceof Error ? er.message : t("forum.saveFail"));
    }
  }

  return (
    <div className="forum-page">
      <h1>{t("register.title")}</h1>
      <p className="subtle-hint">{t("register.communitySubtitle")}</p>
      <form onSubmit={(e) => void onSubmit(e)} className="card composer">
        <label>
          {t("common.email")}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          {t("register.passwordHint")}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={10} />
        </label>
        <label>
          {t("register.displayName")}
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        </label>
        <label>
          {t("register.birthdate")}
          <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} required />
        </label>
        {err && <p className="err">{err}</p>}
        <button type="submit" className="btn">
          {t("register.signUp")}
        </button>
      </form>
      <p className="muted">
        <Link to="/login">{t("register.alreadyHave")}</Link>
      </p>
    </div>
  );
}
