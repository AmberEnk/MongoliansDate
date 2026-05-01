import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { CONTACT_EMAIL, WAITLIST_ONLY_LAUNCH } from "../constants";
import WaitlistSection from "../components/WaitlistSection";
import LandingVisualSection from "../components/LandingVisualSection";

export default function HomePage() {
  const { loggedIn } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="landing-page landing-page--radiant">
      <a href="#main" className="skip-link skip-link--radiant">
        {t("landing.skip")}
      </a>

      <nav className="landing-nav-rail" aria-label="Landing">
        <a href="#visuals">{t("landing.navVisuals")}</a>
        <a href="#waitlist">{t("landing.navWaitlist")}</a>
        <a href="#contact">{t("landing.navContact")}</a>
      </nav>

      <main id="main" className="landing-main" tabIndex={-1}>
        <section className="landing-hero landing-hero--radiant" aria-labelledby="landing-hero-title">
          <h1 id="landing-hero-title" className="sr-only">
            Uchral
          </h1>
          <div className="landing-hero__brand landing-hero__brand--radiant" aria-hidden="true">
            <img
              className="landing-hero__brand-img"
              src="/uchral-logo-header-gradient.png"
              alt=""
              width={1024}
              height={379}
              decoding="async"
            />
          </div>

          <div className="row landing-hero__actions landing-hero__actions--radiant">
            {loggedIn ? (
              <>
                <Link to="/discover" className="btn btn--brand-yellow">
                  {t("home.discover")}
                </Link>
                <Link to="/onboarding" className="btn btn--brand-outline">
                  {t("home.profile")}
                </Link>
              </>
            ) : WAITLIST_ONLY_LAUNCH ? (
              <a href="#waitlist" className="btn btn--brand-yellow">
                {t("landing.heroCtaWaitlist")}
              </a>
            ) : (
              <>
                <Link to="/register" className="btn btn--brand-yellow">
                  {t("register.signUp")}
                </Link>
                <a href="#waitlist" className="btn btn--brand-blue">
                  {t("landing.heroCtaWaitlist")}
                </a>
                <Link to="/login" className="btn btn--brand-outline">
                  {t("home.signIn")}
                </Link>
              </>
            )}
          </div>
        </section>

        <LandingVisualSection />

        <section id="waitlist" className="landing-section landing-section--waitlist-radiant">
          <WaitlistSection compact />
        </section>

        <footer id="contact" className="landing-site-footer landing-site-footer--radiant">
          <p className="landing-site-footer__contact muted">
            {t("landing.contactBefore")}{" "}
            <a
              className="landing-site-footer__mailto"
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Uchral — question")}`}
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="landing-site-footer__legal muted">
            <Link to="/legal/guidelines">{t("home.communityGuidelines")}</Link>
            {" · "}
            <Link to="/legal/privacy">{t("home.privacy")}</Link>
            {" · "}
            <Link to="/legal/terms">{t("home.terms")}</Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
