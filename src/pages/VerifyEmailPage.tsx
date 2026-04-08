import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function VerifyEmailPage() {
  const { t } = useTranslation();

  return (
    <div className="layout">
      <h1>{t("verify.title")}</h1>
      <p className="muted">{t("register.verifyEmailDev")}</p>
      <p>
        <Link to="/login">{t("verify.signInLink")}</Link>
      </p>
    </div>
  );
}
