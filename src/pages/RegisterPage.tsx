import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as store from "../localStore";

export default function RegisterPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [birthdate, setBirthdate] = useState("1995-01-01");
  const [laFounding, setLaFounding] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    const r = store.registerUser({
      email,
      password,
      displayName,
      birthdate,
      optInLaFoundingMember: laFounding,
    });
    if (!r.ok) {
      setErr(r.error);
      return;
    }
    setMsg(t("register.verifyEmailDev"));
  }

  return (
    <div className="layout">
      <h1>{t("register.title")}</h1>
      <p className="subtle-hint">{t("register.subtitle")}</p>
      <form onSubmit={onSubmit} className="card">
        <label>
          {t("common.email")}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          {t("register.passwordHint")}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={10}
          />
        </label>
        <label>
          {t("register.displayName")}
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        </label>
        <label>
          {t("register.birthdate")}
          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            required
          />
        </label>
        <label className="row">
          <input
            type="checkbox"
            checked={laFounding}
            onChange={(e) => setLaFounding(e.target.checked)}
          />
          {t("register.laFounding")}
        </label>
        {err && <p className="err">{err}</p>}
        {msg && <p>{msg}</p>}
        <button type="submit" className="btn" style={{ marginTop: "0.75rem" }}>
          {t("register.signUp")}
        </button>
      </form>
      <p className="muted">
        <Link to="/login">{t("register.alreadyHave")}</Link>
      </p>
    </div>
  );
}
