import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import BrandLogo from "../components/BrandLogo";
import { CONTACT_EMAIL } from "../constants";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await login(email, password);
      nav("/");
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Failed");
    }
  }

  return (
    <div className="forum-page">
      <BrandLogo className="auth-logo" size={96} />
      <h1>{t("login.title")}</h1>
      <p className="subtle-hint">{t("forum.loginHint")}</p>
      <form onSubmit={(e) => void onSubmit(e)} className="card composer">
        <label>
          {t("common.email")}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          {t("common.password")}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {err && <p className="err">{err}</p>}
        <button type="submit" className="btn">
          {t("common.continue")}
        </button>
      </form>
      <p className="muted">
        <Link to="/register">{t("login.createAccount")}</Link>
        {" · "}
        <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Uchral password")}`}>{t("login.forgotPassword")}</a>
      </p>
    </div>
  );
}
