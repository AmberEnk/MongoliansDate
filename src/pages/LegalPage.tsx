import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

type LegalSlug = "terms" | "privacy" | "guidelines" | "data-export";

function isLegalSlug(s: string | undefined): s is LegalSlug {
  return s === "terms" || s === "privacy" || s === "guidelines" || s === "data-export";
}

export default function LegalPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const key: LegalSlug = isLegalSlug(slug) ? slug : "terms";
  const title = t(`legal.${key}.title`);
  const html = t(`legal.${key}.body`);

  return (
    <div className="layout">
      <h1>{title}</h1>
      <div className="card legal-body" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
