import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import InstallPrompt from "./InstallPrompt";
import BrandLogo from "./BrandLogo";

export default function AppShell() {
  const { loggedIn, logout, user, ready } = useAuth();
  const { t } = useTranslation();
  const nav = useNavigate();

  async function onSignOut() {
    await logout();
    nav("/");
  }

  const tabs = [
    { to: "/", label: t("forum.home"), end: true },
    { to: "/popular", label: t("forum.popular") },
    { to: "/news", label: t("forum.news") },
    { to: "/explore", label: t("forum.explore") },
    { to: "/dating", label: t("forum.dating") },
    ...(loggedIn
      ? [
          { to: "/messages", label: t("chat.inboxTitle"), end: false },
          { to: "/me", label: t("forum.mine"), end: false },
        ]
      : []),
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="lang-bar forum-topbar">
          <NavLink to="/" className="brand-link" aria-label={t("brand.full")}>
            <BrandLogo className="brand-link__mark" size={58} decorative />
            <span className="brand-link__text">
              <span className="brand-link__name">{t("brand.name")}</span>
              <span className="brand-link__tag">{t("brand.networking")}</span>
              <span className="brand-link__mn">{t("brand.mn")}</span>
            </span>
          </NavLink>
          <nav className="forum-tabs" aria-label={t("forum.mainNav")}>
            {tabs.map((tab) => (
              <NavLink key={tab.to} to={tab.to} end={tab.end} className={({ isActive }) => (isActive ? "is-active" : "")}>
                {tab.label}
              </NavLink>
            ))}
            <NavLink to="/communities/new" className="forum-tabs__create">
              {t("forum.startCommunity")}
            </NavLink>
          </nav>
          <div className="forum-topbar__actions">
            <NavLink to="/communities/new" className="btn secondary start-community-btn">
              {t("forum.startCommunity")}
            </NavLink>
            {ready && loggedIn ? (
              <>
                <NavLink to="/me" className="forum-user">
                  {user?.displayName}
                </NavLink>
                {user?.isSuperAdmin ? (
                  <NavLink to="/admin/moderation" className="btn secondary">
                    {t("forum.moderation")}
                  </NavLink>
                ) : null}
                <button type="button" className="btn secondary lang-bar__logout" onClick={() => void onSignOut()}>
                  {t("common.signOut")}
                </button>
              </>
            ) : ready ? (
              <>
                <NavLink to="/login" className="btn secondary">
                  {t("home.signIn")}
                </NavLink>
                <NavLink to="/register" className="btn">
                  {t("register.signUp")}
                </NavLink>
              </>
            ) : null}
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <BrandLogo className="app-footer__logo" size={72} decorative />
        <p>{t("brand.footer")}</p>
        <nav className="app-footer__legal" aria-label={t("brand.footer")}>
          <Link to="/help">{t("help.link")}</Link>
          <Link to="/legal/guidelines">{t("home.communityGuidelines")}</Link>
          <Link to="/legal/privacy">{t("home.privacy")}</Link>
          <Link to="/legal/terms">{t("home.terms")}</Link>
        </nav>
      </footer>
      <InstallPrompt />
    </div>
  );
}
