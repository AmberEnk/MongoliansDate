import { Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";

export default function AppShell() {
  const { loggedIn, logout } = useAuth();
  const { t } = useTranslation();
  const nav = useNavigate();

  async function onSignOut() {
    await logout();
    nav("/");
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="lang-bar">
          {loggedIn ? (
            <button type="button" className="btn secondary lang-bar__logout" onClick={() => void onSignOut()}>
              {t("common.signOut")}
            </button>
          ) : (
            <span className="lang-bar__spacer" aria-hidden />
          )}
          <LanguageSwitcher />
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
