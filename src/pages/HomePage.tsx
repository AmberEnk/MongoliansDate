import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";

export default function HomePage() {
  const { loggedIn, debugLogin } = useAuth();
  const { t } = useTranslation();
  return (
    <div className="layout">
      <h1>{t("meta.title")}</h1>
      <p className="muted">{t("home.tagline")}</p>
      <div className="row" style={{ marginTop: "1rem" }}>
        {loggedIn ? (
          <>
            <Link to="/discover" className="btn">
              {t("home.discover")}
            </Link>
            <Link to="/onboarding" className="btn secondary">
              {t("home.profile")}
            </Link>
          </>
        ) : (
          <>
            <Link to="/register" className="btn">
              {t("home.join")}
            </Link>
            <Link to="/login" className="btn secondary">
              {t("home.signIn")}
            </Link>
            <button
              type="button"
              className="btn secondary"
              onClick={() => void debugLogin()}
            >
              {t("home.debugLogin")}
            </button>
          </>
        )}
      </div>
      <p style={{ marginTop: "2rem" }} className="muted">
        <Link to="/legal/guidelines">{t("home.communityGuidelines")}</Link>
        {" · "}
        <Link to="/legal/privacy">{t("home.privacy")}</Link>
        {" · "}
        <Link to="/legal/terms">{t("home.terms")}</Link>
      </p>
    </div>
  );
}
