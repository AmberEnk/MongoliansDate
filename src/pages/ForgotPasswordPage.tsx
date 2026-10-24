import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BrandLogo from "../components/BrandLogo";
import * as forum from "../forum/api";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await forum.requestPasswordReset(email);
      setDone(true);
    } catch (er) {
      setErr(er instanceof Error ? er.message : t("forum.saveFail"));
    }
  }

  return (
    <div className="forum-page">
      <BrandLogo className="auth-logo" size={96} />
      <h1>{t("login.forgotTitle")}</h1>
      <p className="subtle-hint">{t("login.forgotIntro")}</p>
      {done ? (
        <p className="card guest-note">{t("login.forgotSent")}</p>
      ) : (
        <form onSubmit={(e) => void onSubmit(e)} className="card composer">
          <label>
            {t("common.email")}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          {err && <p className="err">{err}</p>}
          <button type="submit" className="btn">
            {t("login.sendReset")}
          </button>
        </form>
      )}
      <p className="muted">
        <Link to="/login">{t("login.title")}</Link>
      </p>
    </div>
  );
}
