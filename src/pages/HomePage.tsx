import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import WaitlistSection from "../components/WaitlistSection";

export default function HomePage() {
  const { loggedIn, debugLogin } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="landing-page">
      <a href="#main" className="skip-link">
        {t("landing.skip")}
      </a>

      <nav className="landing-subnav" aria-label="Page sections">
        <a href="#community">{t("landing.navCommunity")}</a>
        <a href="#problem">{t("landing.navProblem")}</a>
        <a href="#paperwork">{t("landing.navPaperwork")}</a>
        <a href="#features">{t("landing.navFeatures")}</a>
        <a href="#prototype">{t("landing.navPrototype")}</a>
        <a href="#waitlist">{t("landing.navWaitlist")}</a>
      </nav>

      <main id="main" className="landing-main" tabIndex={-1}>
        <section className="landing-hero" aria-labelledby="landing-hero-title">
          <p className="landing-hero__eyebrow">{t("landing.heroEyebrow")}</p>
          <h1 id="landing-hero-title" className="landing-hero__headline">
            <span className="landing-hero__headline-en">{t("landing.heroHeadline")}</span>
            <span className="landing-hero__headline-mn" lang="mn">
              {t("landing.heroHeadlineMn")}
            </span>
          </h1>
          <p className="landing-hero__lede">{t("landing.heroLede")}</p>

          <div className="row landing-hero__actions">
            {loggedIn ? (
              <>
                <Link to="/discover" className="btn">
                  {t("home.discover")}
                </Link>
                <Link to="/onboarding" className="btn secondary">
                  {t("home.profile")}
                </Link>
                <a href="#prototype" className="btn secondary">
                  {t("landing.navPrototype")}
                </a>
              </>
            ) : (
              <>
                <a href="#prototype" className="btn">
                  {t("landing.heroCtaPrototype")}
                </a>
                <a href="#waitlist" className="btn secondary">
                  {t("landing.heroCtaWaitlist")}
                </a>
                <Link to="/register" className="btn secondary">
                  {t("home.join")}
                </Link>
                <Link to="/login" className="btn secondary">
                  {t("home.signIn")}
                </Link>
                <button type="button" className="btn secondary" onClick={() => void debugLogin()}>
                  {t("home.debugLogin")}
                </button>
              </>
            )}
          </div>
        </section>

        <section id="community" className="landing-section">
          <h2 className="landing-section__title">{t("landing.communityTitle")}</h2>
          <p className="landing-section__intro">{t("landing.communityIntro")}</p>
          <ul className="landing-bullets">
            <li>{t("landing.communityBullet1")}</li>
            <li>{t("landing.communityBullet2")}</li>
            <li>{t("landing.communityBullet3")}</li>
            <li>{t("landing.communityBullet4")}</li>
          </ul>
        </section>

        <section id="problem" className="landing-section landing-section--tint">
          <h2 className="landing-section__title">{t("landing.problemTitle")}</h2>
          <p className="landing-section__intro">{t("landing.problemIntro")}</p>
        </section>

        <section id="paperwork" className="landing-section">
          <h2 className="landing-section__title">{t("landing.paperworkTitle")}</h2>
          <p className="landing-section__intro">{t("landing.paperworkIntro")}</p>
          <p className="landing-legal-callout">
            <strong>Legal:</strong> {t("landing.paperworkLegal")}
          </p>
        </section>

        <section id="features" className="landing-section landing-section--tint">
          <h2 className="landing-section__title">{t("landing.featuresTitle")}</h2>
          <p className="landing-section__intro">{t("landing.featuresIntro")}</p>
          <ul className="landing-feature-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <li key={n}>{t(`landing.feature${n}`)}</li>
            ))}
          </ul>
        </section>

        <section id="prototype" className="landing-section landing-section--prototype">
          <h2 className="landing-section__title">{t("landing.prototypeTitle")}</h2>
          <p className="landing-section__intro">{t("landing.prototypeIntro")}</p>
          <div className="row landing-prototype-cta">
            {loggedIn ? (
              <>
                <Link to="/discover" className="btn">
                  {t("landing.prototypeCtaDiscover")}
                </Link>
                <Link to="/onboarding" className="btn secondary">
                  {t("landing.prototypeCtaProfile")}
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn">
                  {t("landing.prototypeCtaRegister")}
                </Link>
                <Link to="/login" className="btn secondary">
                  {t("home.signIn")}
                </Link>
              </>
            )}
          </div>
        </section>

        <section id="waitlist" className="landing-section">
          <h2 className="landing-section__title">{t("landing.waitlistTitle")}</h2>
          <p className="landing-section__intro">{t("landing.waitlistIntro")}</p>
          <WaitlistSection />
        </section>

        <footer className="landing-site-footer">
          <p>{t("landing.siteFooter")}</p>
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
