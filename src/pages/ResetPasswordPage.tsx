import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BrandLogo from "../components/BrandLogo";
import * as forum from "../forum/api";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token")?.trim() ?? "", [params]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password !== confirm) {
      setErr(t("login.passwordMismatch"));
      return;
    }
    try {
      await forum.resetPassword(token, password);
      nav("/login");
    } catch (er) {
      setErr(er instanceof Error ? er.message : t("forum.saveFail"));
    }
  }

  return (
    <div className="forum-page">
      <BrandLogo className="auth-logo" size={96} />
      <h1>{t("login.resetTitle")}</h1>
      {!token ? (
        <p className="err">{t("login.resetInvalid")}</p>
      ) : (
        <form onSubmit={(e) => void onSubmit(e)} className="card composer">
          <label>
            {t("register.passwordHint")}
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={10} />
          </label>
          <label>
            {t("login.confirmPassword")}
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={10} />
          </label>
          {err && <p className="err">{err}</p>}
          <button type="submit" className="btn">
            {t("login.savePassword")}
          </button>
        </form>
      )}
      <p className="muted">
        <Link to="/login">{t("login.title")}</Link>
      </p>
    </div>
  );
}
