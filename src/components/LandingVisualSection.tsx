import { useTranslation } from "react-i18next";

/** Unsplash CDN — free to use under Unsplash License; illustrative stock only. */
const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?w=960&q=82&auto=format&fit=crop`;

const GALLERY = [
  "photo-1695197943218-be1bb14b6894",
  "photo-1647070996344-46339c43751e",
  "photo-1571867424488-4565932edb41",
  "photo-1588848476449-b8295a894596",
  "photo-1516589178581-6cd7833ae3b2",
  "photo-1519741497674-611481863552",
  "photo-1502602898657-3e91760cbb34",
  "photo-1653356549582-311057045381",
  "photo-1680230955697-98238b8fd9cf",
] as const;

function MongolianMotifStrip() {
  return (
    <div className="landing-motif-strip" aria-hidden="true">
      <svg className="landing-motif-strip__pattern" viewBox="0 0 120 24" preserveAspectRatio="none">
        <title>Decorative border</title>
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          d="M0 12c10 0 10-8 20-8s10 8 20 8 10-8 20-8 10 8 20 8 10-8 20-8 10 8 20 8 10-8 20-8 10 8 20 8"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="0.9"
          opacity="0.65"
          d="M4 12h112M8 18c16-6 32 6 48 0s32-6 48 0"
        />
      </svg>
      <div className="landing-motif-strip__icons">
        <svg viewBox="0 0 32 32" className="landing-motif-icon" aria-hidden="true">
          <path
            fill="currentColor"
            d="M16 4L4 10v12l12 6 12-6V10L16 4zm0 3.2l8 4v8.6l-8 4-8-4V11.2l8-4z"
            opacity="0.85"
          />
        </svg>
        <svg viewBox="0 0 32 32" className="landing-motif-icon" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            d="M6 22 L16 8 L26 22 M10 18h12"
          />
        </svg>
        <svg viewBox="0 0 32 32" className="landing-motif-icon" aria-hidden="true">
          <circle cx="16" cy="16" r="3.5" fill="currentColor" opacity="0.7" />
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            d="M16 6v4M16 22v4M6 16h4M22 16h4"
          />
        </svg>
        <svg viewBox="0 0 32 32" className="landing-motif-icon" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            d="M8 12c4-6 12-6 16 0s12 6 16 0M8 20c4 6 12 6 16 0s12-6 16 0"
          />
        </svg>
      </div>
    </div>
  );
}

/** Interlocking bands — common wedding / commitment motif (generic, not a national emblem). */
function InterlockingRingsSymbol() {
  return (
    <div className="landing-rings-symbol" aria-hidden="true">
      <svg viewBox="0 0 120 72" className="landing-rings-symbol__svg">
        <title>Wedding rings symbol</title>
        <ellipse
          cx="44"
          cy="40"
          rx="26"
          ry="18"
          fill="none"
          stroke="url(#ringGold)"
          strokeWidth="4"
          transform="rotate(-25 44 40)"
        />
        <ellipse
          cx="76"
          cy="40"
          rx="26"
          ry="18"
          fill="none"
          stroke="url(#ringGold2)"
          strokeWidth="4"
          transform="rotate(25 76 40)"
        />
        <defs>
          <linearGradient id="ringGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c9a227" />
            <stop offset="100%" stopColor="#8b6914" />
          </linearGradient>
          <linearGradient id="ringGold2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8d5a3" />
            <stop offset="100%" stopColor="#a67c00" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function LandingVisualSection() {
  const { t } = useTranslation();

  return (
    <section id="visuals" className="landing-section landing-section--visuals">
      <MongolianMotifStrip />
      <InterlockingRingsSymbol />

      <h2 className="landing-section__title">{t("landing.visualsTitle")}</h2>
      <p className="landing-section__intro">{t("landing.visualsIntro")}</p>

      <ul className="landing-visual-grid">
        {GALLERY.map((id, i) => (
          <li key={id} className="landing-visual-card">
            <figure className="landing-visual-card__figure">
              <img
                src={UNSPLASH(id)}
                alt={t(`landing.visualAlt${i + 1}`)}
                loading="lazy"
                decoding="async"
                width={960}
                height={640}
                className="landing-visual-card__img"
              />
            </figure>
          </li>
        ))}
      </ul>

      <p className="landing-visuals-credit muted">{t("landing.visualsCredit")}</p>
    </section>
  );
}
