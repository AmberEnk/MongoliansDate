import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";

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
      nav("/discover");
    } catch (er) {
      setErr(er instanceof Error ? er.message : "Failed");
    }
  }

  return (
    <div className="layout">
      <h1>{t("login.title")}</h1>
      <form onSubmit={onSubmit} className="card">
        <label>
          {t("common.email")}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          {t("common.password")}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {err && <p className="err">{err}</p>}
        <button type="submit" className="btn" style={{ marginTop: "0.75rem" }}>
          {t("common.continue")}
        </button>
      </form>
      <p className="muted">
        <Link to="/register">{t("login.createAccount")}</Link>
      </p>
    </div>
  );
}
